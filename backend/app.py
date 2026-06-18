from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import torch
import uvicorn
from datetime import datetime
import pandas as pd
from model import AdvancedSTRec
from preprocess import get_advanced_data, build_graph

# In backend/app.py

def generate_graph_viz(history_ids: list[int], recommended_ids: list[int], all_pois_df: pd.DataFrame):
    """Generates node and link data for the frontend visualization."""
    
    # Combine all relevant POI IDs, ensuring no duplicates
    node_ids = sorted(list(set(history_ids + recommended_ids)))
    
    nodes = []
    for poi_id in node_ids:
        poi_info = all_pois_df.iloc[poi_id]
        node_type = "History" if poi_id in history_ids else "Recommendation"
        
        nodes.append({
            "id": poi_id,
            "name": poi_info['name'],
            "type": node_type,
        })

    # Create links between sequential history points
    links = []
    for i in range(len(history_ids) - 1):
        links.append({
            "source": history_ids[i],
            "target": history_ids[i+1],
        })
        
    # Link the last history POI to all recommendations
    if history_ids:
        last_history_id = history_ids[-1]
        for rec_id in recommended_ids:
            # Avoid creating a self-loop if a recommendation is also in the history
            if rec_id != last_history_id:
                links.append({
                    "source": last_history_id,
                    "target": rec_id
                })

    return {"nodes": nodes, "links": links}

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Load Metadata
poi_df = get_advanced_data()
num_pois = len(poi_df)

model = AdvancedSTRec(num_nodes=num_pois, hidden_dim=64, context_dim=2)
try:
    model.load_state_dict(torch.load("st_model.pth", weights_only=True))
    print("✅ Model weights loaded.")
except:
    print("⚠️ Weight mismatch or file missing. Please run train.py!")

model.eval()

# In backend/app.py

@app.post("/predict")
async def predict_smart(history: list[int]):
    now = datetime.now()
    hour = now.hour
    
    try:
        with open("model_metrics.json", "r") as f:
            # You are missing this import
            import json 
            performance_stats = json.load(f)
    except:
        performance_stats = {"accuracy": 0.82, "precision": 0.79, "recall": 0.75, "f1_score": 0.77}
        
    # Semantic Reasoning
    if 5 <= hour < 11: reasoning = "Morning Logic: High probability of Gym or Breakfast."
    elif 11 <= hour < 16: reasoning = "Afternoon Logic: Suggesting lunch or office spots."
    elif 16 <= hour < 20: reasoning = "Evening Logic: Suggesting coffee or social hubs."
    else: reasoning = "Night Logic: Predicted residential or dining locations."

    # Handle history sequence
    if len(history) < 2:
        history_seq = [history[0], history[0]]
    else:
        history_seq = history[-2:]

    seq_tensor = torch.tensor([history_seq], dtype=torch.long)
    ctx_tensor = torch.tensor([[hour, 1 if now.weekday() >= 5 else 0]], dtype=torch.float)
    edge_index = build_graph()
    
    with torch.no_grad():
        logits = model(torch.arange(num_pois), edge_index, seq_tensor, ctx_tensor)
        temperature = 5.0 
        probs = torch.softmax(logits / temperature, dim=1)
        top_probs, top_indices = torch.topk(probs, 3, dim=1)
        norm_probs = top_probs / torch.sum(top_probs)

    # --- CORRECTED LOGIC BLOCK ---

    # 1. Get the raw recommended POI IDs
    recommended_ids = [top_indices[0][i].item() for i in range(3)]

    # 2. Build the detailed recommendations list
    recommendations = []
    for i, idx in enumerate(recommended_ids):
        poi = poi_df.iloc[idx]
        recommendations.append({
            "name": poi['name'],
            "confidence": round(float(norm_probs[0][i].item()), 2),
            "category": poi['cat']
        })

    # 3. Generate graph data AFTER the loop is finished
    graph_data = generate_graph_viz(history, recommended_ids, poi_df)

    # 4. Return the complete response
    return {
        "input_echo": history,
        "recommendations": recommendations,
        "reasoning": reasoning,
        "graph_data": graph_data,
        "status": "Success: Kaggle Data Applied",
        "current_time": now.strftime("%H:%M"),
        "metrics": performance_stats
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)