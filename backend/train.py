import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from model import AdvancedSTRec
from preprocess import build_graph, CSV_PATH
from sklearn.metrics import precision_recall_fscore_support
import json

def load_and_clean_data():
    print("📂 Loading Kaggle NYC Dataset...")
    df = pd.read_csv(CSV_PATH)
    
    # 1. Convert timestamp and extract features - WITH THE CORRECTED FORMAT
    df['dt'] = pd.to_datetime(df['utcTimestamp'], format='%a %b %d %H:%M:%S %z %Y')
    df['hour'] = df['dt'].dt.hour
    df['is_weekend'] = (df['dt'].dt.dayofweek // 5).astype(float)
    
    # 2. Map venueId to 0-49 (Focusing on Top 50 unique venues)
    unique_venues = df['venueId'].unique()[:50]
    v_map = {vid: i for i, vid in enumerate(unique_venues)}
    df = df[df['venueId'].isin(unique_venues)].copy()
    df['poi_id'] = df['venueId'].map(v_map)
    
    return df

def start_training():
    df = load_and_clean_data()
    num_pois = 50
    hidden_dim = 64
    
    # 3. Create Sliding Window Sequences
    # We take [Visit 1, Visit 2] to predict [Visit 3]
    X_seq = []
    X_ctx = []
    y = []
    
    vals = df[['poi_id', 'hour', 'is_weekend']].values
    for i in range(len(vals) - 2):
        X_seq.append(vals[i:i+2, 0]) # Last 2 POI IDs
        X_ctx.append(vals[i+2, 1:3]) # Context of the target visit
        y.append(vals[i+2, 0])       # Target POI ID
        
    X_seq = np.array(X_seq)
    X_ctx = np.array(X_ctx)
    y = np.array(y)
    
    # Split
    split = train_test_split(X_seq, X_ctx, y, test_size=0.2, random_state=42)
    X_seq_train, X_seq_test, X_ctx_train, X_ctx_test, y_train, y_test = split
    
    model = AdvancedSTRec(num_nodes=num_pois, hidden_dim=hidden_dim, context_dim=2)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.002) # Slightly lower LR for stability
    criterion = nn.CrossEntropyLoss()
    edge_index = build_graph()

    print(f"🚀 Training with Sliding Windows on {len(y_train)} samples...")
    
    for epoch in range(1, 101): # Increased epochs for better pattern recognition
        model.train()
        optimizer.zero_grad()
        
        logits = model(torch.arange(num_pois), edge_index, 
                       torch.tensor(X_seq_train, dtype=torch.long), 
                       torch.tensor(X_ctx_train, dtype=torch.float))
        
        loss = criterion(logits, torch.tensor(y_train, dtype=torch.long))
        loss.backward()
        optimizer.step()
        
        if epoch % 20 == 0:
            model.eval()
            with torch.no_grad():
                t_logits = model(torch.arange(num_pois), edge_index, 
                               torch.tensor(X_seq_test, dtype=torch.long), 
                               torch.tensor(X_ctx_test, dtype=torch.float))
                acc = (t_logits.argmax(1) == torch.tensor(y_test)).float().mean()
                print(f"Epoch {epoch}/100 | Loss: {loss.item():.4f} | Accuracy: {acc:.2%}")

    torch.save(model.state_dict(), "st_model.pth")
    print("✅ Training Complete. Model saved as 'st_model.pth'")
    
    # Calculate and save final metrics
    model.eval()
    with torch.no_grad():
        test_seq = torch.tensor(X_seq_test, dtype=torch.long)
        test_ctx = torch.tensor(X_ctx_test, dtype=torch.float)
        logits = model(torch.arange(num_pois), edge_index, test_seq, test_ctx)
        preds = logits.argmax(1).cpu().numpy()
        actuals = y_test

        # Calculate Metrics
        precision, recall, f1, _ = precision_recall_fscore_support(
            actuals, preds, average='macro', zero_division=0
        )
        
        metrics = {
            "accuracy": float((preds == actuals).mean()),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1)
        }
        
        # Save metrics to a JSON file so app.py can read them
        with open("model_metrics.json", "w") as f:
            json.dump(metrics, f)
        
        print(f"📊 Final Metrics -> Acc: {metrics['accuracy']:.2%}, F1: {metrics['f1_score']:.2%}")

if __name__ == "__main__":
    start_training()