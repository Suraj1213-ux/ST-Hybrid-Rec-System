import pandas as pd
import numpy as np
import torch
import os
from datetime import datetime

# Path to your Kaggle file
CSV_PATH = "dataset_TSMC2014_NYC.csv"

def get_advanced_data():
    if not os.path.exists(CSV_PATH):
        # Fallback if file isn't there yet
        return pd.DataFrame([{"id": 0, "name": "Error: CSV Not Found", "cat": "N/A"}])

    # Load unique POIs from the Kaggle dataset
    df = pd.read_csv(CSV_PATH)
    
    # We take the top 50 most visited venues to keep the graph manageable
    top_venues = df.groupby(['venueId', 'venueCategory']).size().reset_index(name='counts')
    top_venues = top_venues.sort_values('counts', ascending=False).head(50)
    
    # Map venueId (strings like '4abc...') to integer IDs (0, 1, 2...)
    pois = []
    for i, row in top_venues.iterrows():
        pois.append({
            "id": len(pois),
            "venue_id_raw": row['venueId'],
            "name": row['venueCategory'], # Dataset names are often category names
            "cat": row['venueCategory']
        })
    
    return pd.DataFrame(pois)

def build_graph():
    # In a real GCN, we'd build this from lat/lon in the CSV
    # For this implementation, we connect sequential visits found in the data
    edge_index = torch.tensor([
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    ], dtype=torch.long)
    return edge_index

def get_current_context():
    now = datetime.now()
    return {"hour": now.hour, "is_weekend": 1 if now.weekday() >= 5 else 0}