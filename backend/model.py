import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv

class AdvancedSTRec(nn.Module):
    def __init__(self, num_nodes, hidden_dim, context_dim=2):
        super(AdvancedSTRec, self).__init__()
        self.embeddings = nn.Embedding(num_nodes, hidden_dim)
        self.gcn = GCNConv(hidden_dim, hidden_dim)
        self.lstm = nn.LSTM(hidden_dim, hidden_dim, batch_first=True)
        
        # Context layer: Combines LSTM output + [Hour, Weekend_Flag]
        self.fusion = nn.Linear(hidden_dim + context_dim, hidden_dim)
        self.classifier = nn.Linear(hidden_dim, num_nodes)

    def forward(self, x_idx, edge_index, seq_idxs, context_tensor):
        # Spatial
        x = self.embeddings(x_idx)
        x = torch.relu(self.gcn(x, edge_index))
        
        # Temporal
        seq_emb = x[seq_idxs]
        _, (hn, _) = self.lstm(seq_emb)
        
        # Context Injection (Injection of Time/Context)
        combined = torch.cat((hn[-1], context_tensor), dim=1)
        fused = torch.relu(self.fusion(combined))
        
        return self.classifier(fused)