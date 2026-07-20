import React, { useState, useEffect, useRef } from 'react';
import { MapPin, History, BrainCircuit, Navigation, Activity, Loader2, Clock, CheckCircle2, LogOut } from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';
import LoginPage from './components/LoginPage';

// --- GraphVisualizer Component ---
function GraphVisualizer({ data }) {
    const containerRef = useRef();
    const fgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (containerRef.current) {
            setDimensions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
        }
    }, []);
    useEffect(() => {
        if (data && fgRef.current) {
            setTimeout(() => {
                fgRef.current.centerAt(0, 0, 500);
                fgRef.current.zoom(4, 500);
            }, 100);
        }
    }, [data]);
    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div ref={containerRef} className="bg-white rounded-2xl border border-slate-200 h-80 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <MapPin size={40} className="mb-2 text-slate-400" /><p className="font-semibold text-sm text-slate-600">GRAPH CONSTRUCTION</p><p className="text-xs text-slate-400 mt-1">Waiting for Inference Result</p>
            </div>
        );
    }
    return (
        // MODIFIED: Added `relative` to this container
        <div ref={containerRef} className="relative bg-white rounded-2xl border border-slate-200 p-1 h-80 w-full">
            {/* NEW: Added the title element */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
              Graph Construction
            </div>
            <ForceGraph2D ref={fgRef} width={dimensions.width - 2} height={dimensions.height - 2} graphData={data} nodeLabel="name" nodeAutoColorBy="type" linkDirectionalArrowLength={3.5} linkDirectionalArrowRelPos={1} linkWidth={1.5} linkColor={() => 'rgba(150, 150, 150, 0.5)'}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name; const fontSize = 12 / globalScale; ctx.font = `600 ${fontSize}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    const isHistory = node.type === 'History'; ctx.fillStyle = isHistory ? 'rgba(79, 70, 229, 1)' : 'rgba(37, 99, 235, 1)';
                    ctx.beginPath(); ctx.arc(node.x, node.y, 5.5, 0, 2 * Math.PI, false); ctx.fill();
                    ctx.fillStyle = '#1e293b'; ctx.fillText(label, node.x, node.y + 15);
                }}
            />
        </div>
    );
}

// --- Main App Component ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [history, setHistory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const savedLogs = localStorage.getItem('st_recent_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const handlePredict = async () => {
    if (!history) return;
    setLoading(true);
    setError(null);
    setGraphData(null); 
    try {
      const historyArray = history.split(',').map(num => parseInt(num.trim()));
      const response = await fetch('http://localhost:8000/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(historyArray) });
      if (!response.ok) throw new Error("Backend server is not reachable");
      const data = await response.json();
      setResult(data);
      setGraphData(data.graph_data);
      const newLog = { id: Date.now(), input: history, prediction: data.recommendations[0].name, time: data.current_time, status: data.status };
      const updatedLogs = [newLog, ...logs].slice(0, 6);
      setLogs(updatedLogs);
      localStorage.setItem('st_recent_logs', JSON.stringify(updatedLogs));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('st_recent_logs');
  };

  const handleLogin = (username, password) => {
    const HARDCODED_USERNAME = 'admin';
    const HARDCODED_PASSWORD = 'password123';
    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setResult(null);
    setGraphData(null);
    setHistory('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="flex h-screen">
          <div className="w-72 bg-slate-900 text-white p-6 hidden md:flex flex-col border-r border-slate-800">
            <div className="flex items-center gap-3 mb-10"><BrainCircuit className="text-blue-400" size={32} /><h1 className="font-bold text-xl tracking-tight">ST-HybridRec</h1></div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4"><h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><History size={14} /> Recent Activity</h3>{logs.length > 0 && (<button onClick={clearLogs} className="text-[10px] text-slate-500 hover:text-red-400">Clear</button>)}</div>
              <div className="space-y-3">{logs.map(log => (<div key={log.id} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-all"><div className="flex justify-between items-start mb-1"><span className="text-[10px] text-blue-400 font-bold uppercase">Input: {log.input}</span><span className="text-[9px] text-slate-500 flex items-center gap-1"><Clock size={8} /> {log.time}</span></div><p className="text-xs text-slate-300 truncate">➜ {log.prediction}</p></div>))}{logs.length === 0 && (<div className="text-center py-10"><p className="text-slate-600 text-sm italic">No logs generated yet</p></div>)}</div>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-800"><div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20"><p className="text-[10px] text-blue-300 leading-relaxed">Model: GCN + LSTM <br/>Dataset: Foursquare NYC</p></div></div>
          </div>
          <main className="flex-1 p-8 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
              <div><h2 className="text-2xl font-bold text-slate-800">Spatial-Temporal Analysis</h2><p className="text-slate-500 text-sm">Predicting next POI using Deep Learning Fusion</p></div>
              <div className="flex items-center gap-6">
                <div className="text-xs font-mono bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  Engine: Online
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 font-semibold transition-colors" title="Sign Out">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md"><label className="block text-sm font-semibold text-slate-700 mb-2">Visit History Trace</label><div className="relative"><Navigation className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" value={history} onChange={(e) => setHistory(e.target.value)} placeholder="e.g. 0, 1, 2" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700"/></div><p className="text-[10px] text-slate-400 mt-2 italic px-1 underline underline-offset-4 decoration-slate-200">Enter Place IDs (0-5) separated by commas</p><button onClick={handlePredict} disabled={loading || !history} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:shadow-none active:scale-95">{loading ? <Loader2 className="animate-spin" /> : "Run Hybrid Inference"}</button>{error && <p className="text-red-500 text-[10px] mt-4 text-center font-medium bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}</div>
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group"><Activity className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" size={120} /><h3 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit size={18} /> Architecture</h3><p className="text-blue-100 text-xs leading-relaxed opacity-90">This system utilizes Graph Convolutional Networks (GCN) for spatial dependencies and LSTM for temporal sequences.</p></div>
                {result && result.metrics && (<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-left duration-500"><h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} className="text-blue-500" /> Model Performance</h3><div className="grid grid-cols-2 gap-4"><div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p><p className="text-lg font-black text-slate-700">{(result.metrics.accuracy * 100).toFixed(1)}%</p></div><div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] text-slate-400 font-bold uppercase">F1-Score</p><p className="text-lg font-black text-blue-600">{(result.metrics.f1_score * 100).toFixed(1)}%</p></div><div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] text-slate-400 font-bold uppercase">Precision</p><p className="text-lg font-black text-slate-700">{(result.metrics.precision * 100).toFixed(1)}%</p></div><div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-[10px] text-slate-400 font-bold uppercase">Recall</p><p className="text-lg font-black text-slate-700">{(result.metrics.recall * 100).toFixed(1)}%</p></div></div><p className="text-[9px] text-slate-400 mt-4 leading-tight italic">*Metrics calculated via 80/20 Train-Test split on Foursquare NYC dataset.</p></div>)}
              </div>
              <div className="lg:col-span-2">
                {!result ? (<GraphVisualizer data={null} />) : (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700"><GraphVisualizer data={graphData} /><div className="bg-white border-l-4 border-blue-500 rounded-r-2xl p-5 shadow-sm flex items-center justify-between"><div><p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Semantic Reasoning</p><div className="flex items-center gap-2 text-slate-700 font-semibold"><Clock size={16} className="text-slate-400" />{result.reasoning}</div></div><div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Traceability</p><code className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 font-bold text-xs">[{result.input_echo.join(", ")}]</code></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{result.recommendations.map((poi, index) => (<div key={index} className={`relative bg-white border rounded-2xl p-6 transition-all hover:translate-y-[-4px] hover:shadow-lg ${index === 0 ? 'border-blue-500 shadow-blue-50/50' : 'border-slate-200'}`}><div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Rank #{index + 1}</div><div className="mt-4"><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{poi.category}</span><h3 className="text-lg font-bold text-slate-800 mt-2 truncate">{poi.name}</h3></div><div className="mt-6"><div className="flex justify-between items-end mb-2"><span className="text-[10px] text-slate-400 font-bold uppercase">Confidence</span><span className={`text-lg font-black ${index === 0 ? 'text-blue-600' : 'text-slate-600'}`}>{(poi.confidence * 100).toFixed(0)}%</span></div><div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-blue-600' : 'bg-slate-400'}`} style={{ width: `${poi.confidence * 100}%` }}></div></div></div></div>))}</div><div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between text-white/80"><div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-400" /><span className="text-xs font-medium">{result.status}</span></div><span className="text-[10px] font-mono text-white/40">TSMC2014_NYC_DEPLOYED</span></div></div>)}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;