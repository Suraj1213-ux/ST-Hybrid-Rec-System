// src/components/GraphVisualizer.js
import React from 'react';
import  ForceGraph2D  from 'react-force-graph-2d';
import { MapPin } from 'lucide-react';

// This component will receive the graph data as a prop
export default function GraphVisualizer({ data }) {

  // If there's no data yet, show the placeholder from your original UI
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="bg-slate-100 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
        <MapPin size={48} className="mb-2 text-slate-400" />
        <p className="font-bold text-sm uppercase tracking-widest">Graph Construction</p>
        <p className="text-[10px] mt-1">Waiting for Inference Result</p>
      </div>
    );
  }

  // If data is present, render the graph
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-2 h-full min-h-[300px]">
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        nodeAutoColorBy="type"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkWidth={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Style nodes based on type (History vs Recommendation)
          const isHistory = node.type === 'History';
          ctx.fillStyle = isHistory ? 'rgba(79, 70, 229, 0.9)' : 'rgba(37, 99, 235, 1)'; // Indigo for history, Blue for recommendation
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false); // Draw a circle for the node
          ctx.fill();
          
          ctx.fillStyle = '#333'; // Text color
          ctx.fillText(label, node.x, node.y + 12); // Position label below the node
        }}
      />
    </div>
  );
}