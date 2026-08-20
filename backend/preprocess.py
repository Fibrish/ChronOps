import json
import random
import os
import networkx as nx
from shapely import wkt

GRAPHML_PATH = os.path.join(os.path.dirname(__file__), "..", "indiranagar_bang_map.graphml")
GEOJSON_PATH = os.path.join(os.path.dirname(__file__), "..", "traffic_predictions.geojson")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
ACTIVE_GRAPHML = os.path.join(OUTPUT_DIR, "indiranagar_active.graphml")
LIVE_ROADS_GEOJSON = os.path.join(OUTPUT_DIR, "indiranagar_live_roads.geojson")

HIGHWAY_FREE_FLOW = {
    "primary": 50.0,
    "primary_link": 40.0,
    "secondary": 45.0,
    "secondary_link": 35.0,
    "tertiary": 40.0,
    "tertiary_link": 35.0,
    "residential": 30.0,
    "living_street": 20.0,
    "unclassified": 30.0,
}

ARTERIAL_TYPES = {"primary", "primary_link", "secondary", "secondary_link", "trunk", "trunk_link"}


def load_congestion_factors(geojson_path):
    with open(geojson_path, "r") as f:
        data = json.load(f)

    factors = []
    for feat in data["features"]:
        props = feat["properties"]
        dw = props.get("dynamic_weight", 1.0)
        factor = 1.0 / max(dw, 0.1)
        factor = max(0.1, min(factor, 1.0))
        factors.append(factor)

    factors.sort()
    worst_30 = factors[: max(1, int(len(factors) * 0.3))]
    best_50 = factors[max(1, int(len(factors) * 0.5)):]

    return factors, worst_30, best_50


def get_free_flow_speed(edge_data):
    if "speed_kph" in edge_data:
        try:
            return max(float(edge_data["speed_kph"]), 5.0)
        except (ValueError, TypeError):
            pass

    highway = edge_data.get("highway", "residential")
    if isinstance(highway, list):
        highway = highway[0]
    return HIGHWAY_FREE_FLOW.get(highway, 30.0)


def classify_severity(congestion_factor):
    if congestion_factor > 0.75:
        return "free"
    elif congestion_factor >= 0.45:
        return "moderate"
    else:
        return "severe"


def edge_geometry_to_coords(edge_data, node_from_data, node_to_data):
    if "geometry" in edge_data:
        try:
            geom = wkt.loads(edge_data["geometry"])
            return list(geom.coords)
        except Exception:
            pass

    x1 = float(node_from_data.get("x", 0))
    y1 = float(node_from_data.get("y", 0))
    x2 = float(node_to_data.get("x", 0))
    y2 = float(node_to_data.get("y", 0))
    return [(x1, y1), (x2, y2)]


def process_graph(G, all_factors, worst_30, best_50):
    random.seed(42)

    for u, v, k, data in G.edges(data=True, keys=True):
        highway = data.get("highway", "residential")
        if isinstance(highway, list):
            highway = highway[0]

        if highway in ARTERIAL_TYPES:
            cf = random.choice(worst_30)
        else:
            cf = random.choice(best_50)

        free_flow = get_free_flow_speed(data)
        length_m = float(data.get("length", 100.0))
        length_km = length_m / 1000.0

        baseline_cost = (length_km / free_flow) * 3600
        predicted_speed = max(free_flow * cf, 1.39)
        proactive_cost = (length_km / predicted_speed) * 3600

        severity = classify_severity(cf)

        data["congestion_factor"] = str(round(cf, 4))
        data["free_flow_speed"] = str(round(free_flow, 2))
        data["predicted_speed"] = str(round(predicted_speed, 2))
        data["baseline_cost"] = str(round(baseline_cost, 4))
        data["proactive_cost"] = str(round(proactive_cost, 4))
        data["severity"] = severity

    return G


def graph_to_geojson(G):
    features = []

    for u, v, k, data in G.edges(data=True, keys=True):
        node_from = G.nodes[u]
        node_to = G.nodes[v]
        coords = edge_geometry_to_coords(data, node_from, node_to)

        geojson_coords = [[round(c[0], 7), round(c[1], 7)] for c in coords]

        road_name = data.get("name", "Unnamed Road")
        highway = data.get("highway", "residential")
        if isinstance(highway, list):
            highway = highway[0]

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": geojson_coords,
            },
            "properties": {
                "edge_id": f"{u}-{v}-{k}",
                "road_name": road_name,
                "highway_type": highway,
                "severity": data.get("severity", "free"),
                "congestion_factor": float(data.get("congestion_factor", 1.0)),
                "free_flow_speed": float(data.get("free_flow_speed", 30.0)),
                "predicted_speed": float(data.get("predicted_speed", 30.0)),
                "baseline_cost": float(data.get("baseline_cost", 0)),
                "proactive_cost": float(data.get("proactive_cost", 0)),
                "length_m": float(data.get("length", 0)),
            },
        }
        features.append(feature)

    return {"type": "FeatureCollection", "features": features}


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Loading road network...")
    G = nx.read_graphml(GRAPHML_PATH)
    print(f"  Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}")

    print("Loading congestion factors from predictions...")
    all_factors, worst_30, best_50 = load_congestion_factors(GEOJSON_PATH)
    print(f"  Total factors: {len(all_factors)}")
    print(f"  Worst 30%: {len(worst_30)} (range {min(worst_30):.2f}-{max(worst_30):.2f})")
    print(f"  Best 50%: {len(best_50)} (range {min(best_50):.2f}-{max(best_50):.2f})")

    print("Injecting congestion onto Indiranagar edges...")
    G = process_graph(G, all_factors, worst_30, best_50)

    sample_edge = list(G.edges(data=True, keys=True))[0]
    print(f"  Sample edge attrs: { {k: sample_edge[3][k] for k in ['severity','congestion_factor','baseline_cost','proactive_cost']} }")

    severity_counts = {"free": 0, "moderate": 0, "severe": 0}
    for u, v, k, d in G.edges(data=True, keys=True):
        severity_counts[d.get("severity", "free")] += 1
    print(f"  Severity distribution: {severity_counts}")

    print(f"Saving active graph to {ACTIVE_GRAPHML}...")
    nx.write_graphml(G, ACTIVE_GRAPHML)

    print(f"Exporting road GeoJSON to {LIVE_ROADS_GEOJSON}...")
    geojson = graph_to_geojson(G)
    with open(LIVE_ROADS_GEOJSON, "w") as f:
        json.dump(geojson, f)
    print(f"  {len(geojson['features'])} road segments exported")

    print("Done!")


if __name__ == "__main__":
    main()
