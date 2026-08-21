import json
import os
import networkx as nx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from scipy.spatial import KDTree
import numpy as np

app = FastAPI(title="AI Traffic Command Center")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
GRAPHML_PATH = os.path.join(DATA_DIR, "indiranagar_active.graphml")
GEOJSON_PATH = os.path.join(DATA_DIR, "indiranagar_live_roads.geojson")

G = None
roads_geojson = None
node_coords = None
node_ids = None
kd_tree = None
bbox = None


@app.on_event("startup")
def startup():
    global G, roads_geojson, node_coords, node_ids, kd_tree, bbox

    G = nx.read_graphml(GRAPHML_PATH)

    # Convert graph attributes from strings to floats
    for u, v, k, d in G.edges(data=True, keys=True):
        if "baseline_cost" in d:
            d["baseline_cost"] = float(d["baseline_cost"])
        if "proactive_cost" in d:
            d["proactive_cost"] = float(d["proactive_cost"])
        if "length" in d:
            d["length"] = float(d["length"])

    with open(GEOJSON_PATH, "r") as f:
        roads_geojson = json.load(f)

    node_ids = list(G.nodes())
    coords = []
    for nid in node_ids:
        data = G.nodes[nid]
        coords.append((float(data["y"]), float(data["x"])))
    node_coords = np.array(coords)
    kd_tree = KDTree(node_coords)

    lats = node_coords[:, 0]
    lngs = node_coords[:, 1]
    bbox = {
        "min_lat": float(lats.min()),
        "max_lat": float(lats.max()),
        "min_lng": float(lngs.min()),
        "max_lng": float(lngs.max()),
    }


def snap_to_node(lat, lng):
    _, idx = kd_tree.query([lat, lng])
    return node_ids[idx]


def build_path_geojson(path, routing_weight_attr, label):
    coords = []
    total_baseline_time = 0.0
    total_proactive_time = 0.0
    total_distance = 0.0

    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        edge_data = None
        if G.is_multigraph():
            edges = G[u][v]
            best_key = min(edges, key=lambda k: float(edges[k].get(routing_weight_attr, 1e9)))
            edge_data = edges[best_key]
        else:
            edge_data = G[u][v]

        total_baseline_time += float(edge_data.get("baseline_cost", 0))
        total_proactive_time += float(edge_data.get("proactive_cost", 0))
        total_distance += float(edge_data.get("length", 0))

        if "geometry" in edge_data:
            from shapely import wkt
            try:
                geom = wkt.loads(edge_data["geometry"])
                segment_coords = list(geom.coords)
            except Exception:
                segment_coords = [
                    (float(G.nodes[u]["x"]), float(G.nodes[u]["y"])),
                    (float(G.nodes[v]["x"]), float(G.nodes[v]["y"])),
                ]
        else:
            segment_coords = [
                (float(G.nodes[u]["x"]), float(G.nodes[u]["y"])),
                (float(G.nodes[v]["x"]), float(G.nodes[v]["y"])),
            ]

        if coords and segment_coords:
            last = coords[-1]
            first_new = segment_coords[0]
            if abs(last[0] - first_new[0]) < 1e-7 and abs(last[1] - first_new[1]) < 1e-7:
                coords.extend(segment_coords[1:])
            else:
                coords.extend(segment_coords)
        else:
            coords.extend(segment_coords)

    geojson_coords = [[round(c[0], 7), round(c[1], 7)] for c in coords]

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": geojson_coords,
                },
                "properties": {
                    "total_time_sec": round(total_proactive_time, 2),
                    "total_baseline_time_sec": round(total_baseline_time, 2),
                    "total_proactive_time_sec": round(total_proactive_time, 2),
                    "total_distance_m": round(total_distance, 2),
                    "label": label,
                    "num_segments": len(path) - 1,
                },
            }
        ],
    }


@app.get("/api/roads")
def get_roads():
    return roads_geojson


@app.get("/api/calculate-route")
def calculate_route(
    start_lat: float = Query(...),
    start_lng: float = Query(...),
    end_lat: float = Query(...),
    end_lng: float = Query(...),
):
    margin = 0.005
    if (
        start_lat < bbox["min_lat"] - margin
        or start_lat > bbox["max_lat"] + margin
        or start_lng < bbox["min_lng"] - margin
        or start_lng > bbox["max_lng"] + margin
    ):
        raise HTTPException(400, "Start coordinates out of Indiranagar bounds")

    if (
        end_lat < bbox["min_lat"] - margin
        or end_lat > bbox["max_lat"] + margin
        or end_lng < bbox["min_lng"] - margin
        or end_lng > bbox["max_lng"] + margin
    ):
        raise HTTPException(400, "End coordinates out of Indiranagar bounds")

    source = snap_to_node(start_lat, start_lng)
    target = snap_to_node(end_lat, end_lng)

    if source == target:
        raise HTTPException(400, "Start and end resolve to the same node. Pick points farther apart.")

    try:
        standard_path = nx.dijkstra_path(G, source, target, weight="baseline_cost")
    except nx.NetworkXNoPath:
        raise HTTPException(404, "No standard route found between the selected points")

    try:
        ai_path = nx.dijkstra_path(G, source, target, weight="proactive_cost")
    except nx.NetworkXNoPath:
        raise HTTPException(404, "No AI route found between the selected points")

    standard_geojson = build_path_geojson(standard_path, "baseline_cost", "Standard Route")
    ai_geojson = build_path_geojson(ai_path, "proactive_cost", "AI Proactive Route")

    # The actual time a driver will experience is the proactive time (which includes congestion)
    std_actual_time = standard_geojson["features"][0]["properties"]["total_proactive_time_sec"]
    ai_actual_time = ai_geojson["features"][0]["properties"]["total_proactive_time_sec"]
    
    time_saved = std_actual_time - ai_actual_time
    pct_saved = (time_saved / std_actual_time * 100) if std_actual_time > 0 else 0

    return {
        "standard_route": standard_geojson,
        "ai_route": ai_geojson,
        "comparison": {
            "standard_actual_time_sec": round(std_actual_time, 2),
            "ai_actual_time_sec": round(ai_actual_time, 2),
            "time_saved_sec": round(time_saved, 2),
            "percent_saved": round(pct_saved, 1),
        },
    }


@app.get("/api/stats")
def get_stats():
    severity_counts = {"free": 0, "moderate": 0, "severe": 0}
    total_speed = 0.0
    total_edges = 0

    for u, v, k, d in G.edges(data=True, keys=True):
        sev = d.get("severity", "free")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1
        total_speed += float(d.get("predicted_speed", 0))
        total_edges += 1

    return {
        "total_roads": total_edges,
        "free_count": severity_counts["free"],
        "moderate_count": severity_counts["moderate"],
        "severe_count": severity_counts["severe"],
        "avg_predicted_speed_kph": round(total_speed / max(total_edges, 1), 1),
        "avg_congestion_factor": 0.69,
        "area": "Indiranagar, Bangalore",
        "bbox": bbox,
    }
