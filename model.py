import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
import pickle
import json

def get_normalized_adj(adj):
    adj = adj + np.eye(adj.shape[0])
    d = np.array(adj.sum(1))
    d_inv_sqrt = np.power(d, -0.5).flatten()
    d_inv_sqrt[np.isinf(d_inv_sqrt)] = 0.0
    d_mat_inv_sqrt = np.diag(d_inv_sqrt)
    normalized_laplacian = np.eye(adj.shape[0]) - d_mat_inv_sqrt.dot(adj).dot(d_mat_inv_sqrt)
    return torch.FloatTensor(normalized_laplacian)

class TrafficDataset(Dataset):
    def __init__(self, data, in_steps=12, out_steps=6):
        self.data = data
        self.in_steps = in_steps
        self.out_steps = out_steps
        
    def __len__(self):
        return len(self.data) - self.in_steps - self.out_steps + 1

    def __getitem__(self, idx):
        x = self.data[idx : idx + self.in_steps]
        y = self.data[idx + self.in_steps : idx + self.in_steps + self.out_steps]
        x_tensor = torch.FloatTensor(x).transpose(0, 1).unsqueeze(0)
        y_tensor = torch.FloatTensor(y)
        return x_tensor, y_tensor

class TemporalConv(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3):
        super(TemporalConv, self).__init__()
        self.conv = nn.Conv2d(in_channels, 2 * out_channels, (1, kernel_size))

    def forward(self, x):
        x = self.conv(x)
        p, q = torch.chunk(x, 2, dim=1)
        return p * torch.sigmoid(q)

class SpatialConv(nn.Module):
    def __init__(self, in_channels, out_channels, num_nodes):
        super(SpatialConv, self).__init__()
        self.weight = nn.Parameter(torch.FloatTensor(in_channels, out_channels))
        nn.init.xavier_uniform_(self.weight)

    def forward(self, x, L):
        B, C, N, T = x.shape
        x = x.permute(0, 3, 2, 1).reshape(-1, N, C)
        out = torch.matmul(L, x)
        out = torch.matmul(out, self.weight)
        return out.view(B, T, N, -1).permute(0, 3, 2, 1)

class STGCN_Block(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels, num_nodes):
        super(STGCN_Block, self).__init__()
        self.tconv1 = TemporalConv(in_channels, hidden_channels)
        self.sconv = SpatialConv(hidden_channels, hidden_channels, num_nodes)
        self.tconv2 = TemporalConv(hidden_channels, out_channels)
        self.norm = nn.BatchNorm2d(num_nodes)

    def forward(self, x, L):
        x = self.tconv1(x)
        x = self.sconv(x, L)
        x = F.relu(x)
        x = self.tconv2(x)
        x = self.norm(x.permute(0, 2, 1, 3)).permute(0, 2, 1, 3)
        return x

class WeatherAware_STGCN(nn.Module):
    def __init__(self, num_nodes, L, out_steps=6):
        super(WeatherAware_STGCN, self).__init__()
        self.L = L
        
        self.block1 = STGCN_Block(1, 16, 32, num_nodes)
        self.block2 = STGCN_Block(32, 32, 64, num_nodes)
        
        self.weather_layer = nn.Conv1d(in_channels=4, out_channels=64, kernel_size=9)
        self.fc = nn.Conv2d(64, out_steps, (1, 4)) 

    def forward(self, x):
        st_out = self.block1(x, self.L) 
        st_out = self.block2(st_out, self.L)
        
        weather_data = x[:, 0, 15:19, :] 
        w_emb = self.weather_layer(weather_data).unsqueeze(2)
        
        fused_out = st_out + (st_out * torch.sigmoid(w_emb))
        x = self.fc(fused_out)
        return x.squeeze(3).permute(0, 1, 2)

def export_to_geojson(predictions, current_speeds, sensor_ids, meta_df, filename="traffic_predictions_v3.geojson"):
    features = []
    for idx, s_id in enumerate(sensor_ids):
        meta_info = meta_df[meta_df['sensor_id'] == int(s_id)]
        if meta_info.empty: continue
            
        lat, lon = float(meta_info['Latitude'].values[0]), float(meta_info['Longitude'].values[0])
        curr_speed = float(current_speeds[idx])
        pred_speed_30m = float(predictions[5, idx])
        
        status_color = "red" if pred_speed_30m < 30.0 else "yellow" if pred_speed_30m < 50.0 else "green"
        dynamic_weight = round(60.0 / max(pred_speed_30m, 5.0), 2)
        
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[lon, lat], [lon + 0.0005, lat + 0.0005]]
            },
            "properties": {
                "segment_id": str(s_id),
                "current_speed": round(curr_speed, 1),
                "predicted_speed_30m": round(pred_speed_30m, 1),
                "status_color": status_color,
                "dynamic_weight": dynamic_weight
            }
        })
        
    with open(filename, 'w') as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, indent=2)
    print(f"\n[+] Exported '{filename}' for OSMnx!")

def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Hardware initialization... Using device: {device}")
    if device.type == 'cuda':
        torch.backends.cudnn.benchmark = True 
    
    print("Loading datasets from 'Data' folder...")
    
    df = pd.read_csv(r'Data/Indirangar_bangalore_traffic_dataset.csv')
    df_numeric = df.drop(columns=['Date']).astype(np.float32)
    raw_data = df_numeric.values
    
    num_nodes = raw_data.shape[1] 
    adj_mx = np.ones((num_nodes, num_nodes))
    L = get_normalized_adj(adj_mx).to(device)
    
    sensor_ids = [str(i) for i in range(num_nodes)]
    meta_df = pd.DataFrame({
        'sensor_id': [int(i) for i in sensor_ids],
        'Latitude': [12.9784 + (i * 0.0001) for i in range(num_nodes)], 
        'Longitude': [77.6408 + (i * 0.0001) for i in range(num_nodes)]
    })
    
    train_mean = np.mean(raw_data, axis=0)
    train_std = np.std(raw_data, axis=0)
    train_std[train_std == 0] = 1.0 
    
    data_scaled = (raw_data - train_mean) / train_std
    
    in_steps, out_steps = 12, 6
    dataset = TrafficDataset(data_scaled, in_steps, out_steps)
    train_loader = DataLoader(
        dataset, batch_size=32, shuffle=True, 
        pin_memory=(device.type == 'cuda'), num_workers=2
    )
    
    model = WeatherAware_STGCN(num_nodes=num_nodes, L=L, out_steps=out_steps).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.005, weight_decay=1e-4) 
    criterion = nn.L1Loss() 
    
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=3
    )
    
    SPEED_INDEX = 1 
    TOTAL_EPOCHS = 100
    EARLY_STOP_THRESHOLD = 2.50
    
    print(f"\nStarting GPU-Accelerated Targeted training loop ({TOTAL_EPOCHS} Epochs)...")
    for epoch in range(TOTAL_EPOCHS):
        model.train()
        epoch_loss = 0.0
        
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            
            optimizer.zero_grad()
            output = model(batch_x)
    
            loss = criterion(output[:, :, SPEED_INDEX], batch_y[:, :, SPEED_INDEX])
            
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
            optimizer.step()
            epoch_loss += loss.item()
            
        avg_loss = epoch_loss / len(train_loader)
        actual_speed_error = avg_loss * train_std[SPEED_INDEX] 
        
        scheduler.step(avg_loss)
        
        print(f"Epoch {epoch+1:03d}/{TOTAL_EPOCHS} | Scaled Speed Loss: {avg_loss:.4f} | Avg Speed Error: ±{actual_speed_error:.2f} km/h")
        
        if actual_speed_error < EARLY_STOP_THRESHOLD:
            print(f"\n[!] Target accuracy reached (±{actual_speed_error:.2f} km/h). Stopping early to prevent overfitting!")
            break
        
    print("\nRunning final inference...")
    model.eval()
    with torch.no_grad():
        live_input = torch.FloatTensor(data_scaled[-in_steps:]).transpose(0, 1).unsqueeze(0).unsqueeze(0).to(device)
        final_prediction_scaled = model(live_input)[0].cpu()
        
    final_prediction = (final_prediction_scaled.numpy() * train_std) + train_mean
    current_speeds = (data_scaled[-1] * train_std) + train_mean
    
    export_to_geojson(final_prediction, current_speeds, sensor_ids, meta_df, filename="traffic_predictions_v1.geojson")

if __name__ == "__main__":
    main()