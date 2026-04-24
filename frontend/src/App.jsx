import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  TreePine, 
  AlertCircle, 
  Layers, 
  Trash2, 
  Database,
  Search,
  RefreshCw,
  Zap,
  Activity,
  Terminal,
  Clock,
  LayoutGrid,
  Cpu,
  Monitor,
  ChevronRight,
  Code2
} from 'lucide-react';

const API_URL = 'https://bjaj-full-stack.onrender.com/bfhl';

function App() {
  const [input, setInput] = useState('{\n  "data": ["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X"]\n}');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-10));
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLogs([]);
    addLog("Initializing Graph Engine...");
    
    try {
      addLog("Parsing input manifest...");
      const jsonData = JSON.parse(input);
      addLog(`Payload detected: ${jsonData.data?.length || 0} edges`);
      
      addLog("Transmitting to BFHL Core...");
      const res = await axios.post(API_URL, jsonData);
      
      addLog("Success: Response received (200 OK)");
      addLog(`Summary: ${res.data.summary.total_trees} trees, ${res.data.summary.total_cycles} cycles.`);
      setResponse(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "UNKNOWN CORE FAILURE";
      setError(msg);
      addLog(`FATAL ERROR: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResponse(null);
    setError(null);
    addLog("System buffer cleared.");
  };

  return (
    <div className="min-h-screen">
      {/* Top Banner */}
      <div className="ribbon">
        <marquee scrollamount="12" direction="left">
          • CORE_LOAD: 12% • MEMORY: 256MB • DISK: 1.2GB • STATUS: NOMINAL • SRM BFHL PRO READY • SESSION ACTIVE • 
          CORE_LOAD: 12% • MEMORY: 256MB • DISK: 1.2GB • STATUS: NOMINAL • SRM BFHL PRO READY • SESSION ACTIVE • 
        </marquee>
      </div>

      <div className="bento-container">
        {/* HEADER */}
        <header className="bento-cell cell-header bg-primary">
           <div className="flex items-center gap-4">
              <div className="bg-accent p-3 border-2 border-primary rotate-[-2deg]">
                 <Code2 size={24} color="black" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter">GRAPH_IQ</h1>
                <p className="text-[10px] font-black tracking-widest text-accent">SRM_RESEARCH_ENGINE</p>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-4 px-4 py-1 border-2 border-white/20 rounded-md">
                 <Clock size={16} className="text-accent" />
                 <span className="font-mono text-xs font-bold">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="badge-status">
                 SECURE: <span className="text-secondary">AES_256</span>
              </div>
           </div>
        </header>

        {/* METRICS ROW */}
        <div className="cell-metrics">
           <Metric label="PROCESSING_TIME" value={response?.meta?.execution_time_ms ? `${response.meta.execution_time_ms}ms` : '0.00ms'} icon={<Activity size={14}/>} color="bg-secondary" />
           <Metric label="EDGES_TRACKED" value={response?.meta?.node_count || '0'} icon={<Layers size={14}/>} color="bg-accent" />
           <Metric label="CPU_LOAD" value="12.4%" icon={<Cpu size={14}/>} color="bg-white" />
           <Metric label="RAM_ALLOC" value="512MB" icon={<Monitor size={14}/>} color="bg-accent" />
        </div>

        {/* INPUT & STATUS BOX */}
        <div className="bento-cell cell-input flex-col gap-6">
           <div className="flex-col gap-4">
              <div className="flex items-center gap-2">
                 <span className="tag-neo">SOURCE_CODE</span>
                 <Database size={16} />
              </div>
              <form onSubmit={handleSubmit} className="flex-col gap-4">
                 <textarea
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   className="input-neo h-80 font-bold bg-slate-50"
                   placeholder='{"data": ["X->Y"]}'
                 />
                 <div className="flex gap-2">
                   <button type="submit" disabled={loading} className="btn-neo flex-1 flex items-center justify-center gap-3">
                      {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                      <span className="text-lg">INITIALIZE_ENGINE</span>
                   </button>
                   <button type="button" onClick={clearResults} className="btn-neo bg-white hover:bg-red-50">
                      <Trash2 size={24} />
                   </button>
                 </div>
              </form>
              {error && (
                <div className="bg-danger p-4 border-4 border-black text-xs font-black flex items-center gap-3 mt-4">
                   <AlertCircle size={20} /> {error.toUpperCase()}
                </div>
              )}
           </div>

           {/* SYSTEM CONSOLE */}
           <div className="bento-cell bg-black text-green-500 font-mono p-4 shadow-none border-2">
              <div className="flex items-center gap-2 mb-2 border-b border-green-900 pb-1">
                 <Terminal size={14} />
                 <span className="text-[10px] font-bold">SYSTEM_LOG</span>
              </div>
              <div className="h-24 overflow-y-auto text-[10px] space-y-1 custom-scrollbar">
                 {logs.length === 0 && <p className="opacity-40">&gt; Waiting for command...</p>}
                 {logs.map((log, i) => (
                   <p key={i} className="animate-in slide-in-from-left duration-200">&gt; {log}</p>
                 ))}
                 <div ref={logEndRef} />
              </div>
           </div>
        </div>

        {/* OUTPUT ANALYSIS */}
        <div className="bento-cell cell-output overflow-hidden">
           <AnimatePresence mode="wait">
             {!response ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center gap-8 relative"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity size={300} strokeWidth={1} />
                  </div>
                  <div className="p-12 border-4 border-black bg-accent rotate-[-4deg] relative z-10 shadow-[8px_8px_0px_#000]">
                     <Search size={80} strokeWidth={3} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-4xl font-black">AWAITING_SEQUENCE</h3>
                    <p className="font-bold text-slate-500 mt-2">TRANSFUSE DATA INTO ENGINE FOR VISUALIZATION</p>
                  </div>
                </motion.div>
             ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-col gap-10"
                >
                   {/* Summary Badges Header */}
                   <div className="flex flex-wrap gap-4 mb-4">
                      <SummaryBadge icon={<TreePine size={18} />} label="TREES" value={response.summary.total_trees} />
                      <SummaryBadge icon={<RefreshCw size={18} />} label="CYCLES" value={response.summary.total_cycles} isDanger={response.summary.total_cycles > 0} />
                      <SummaryBadge icon={<Zap size={18} />} label="CORE_ROOT" value={response.summary.largest_tree_root || 'N/A'} />
                   </div>

                   {/* Main Extraction Feed */}
                   <div className="flex-col gap-6">
                      <div className="flex items-center gap-4 bg-black text-white p-2">
                         <LayoutGrid size={24} className="text-accent" />
                         <h3 className="text-xl font-black uppercase tracking-tight">Extracted_Hierarchies</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                         {response.hierarchies.map((h, i) => (
                            <ResultCard key={i} data={h} />
                         ))}
                      </div>
                   </div>

                   {/* Footer Logs Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                      <div className="bento-cell bg-slate-100 p-6 shadow-[5px_5px_0px_#000]">
                         <h4 className="font-black text-xs border-b-4 border-black mb-4 pb-2">INVALID_ENTRIES_LOG</h4>
                         <div className="flex flex-wrap gap-2">
                            {response.invalid_entries.length > 0 ? response.invalid_entries.map((item, idx) => (
                               <span key={idx} className="badge-status bg-white text-danger border-danger">{item}</span>
                            )) : <p className="text-xs font-bold opacity-30 italic">NO ANOMALIES DETECTED</p>}
                         </div>
                      </div>
                      <div className="bento-cell bg-white p-6 shadow-[5px_5px_0px_#000]">
                         <h4 className="font-black text-xs border-b-4 border-black mb-4 pb-2">DUPLICATE_COLLISION_LOG</h4>
                         <div className="flex flex-wrap gap-2">
                             {response.duplicate_edges.length > 0 ? response.duplicate_edges.map((item, idx) => (
                               <span key={idx} className="badge-status bg-slate-50">{item}</span>
                            )) : <p className="text-xs font-bold opacity-30 italic">NO DUPLICATES REGISTERED</p>}
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon, color }) {
  return (
    <div className="metric-card bg-white hover:bg-black hover:text-white transition-colors duration-200">
       <div className="flex items-center gap-2 mb-1">
          <div className={`p-1 ${color} border border-black text-black`}>{icon}</div>
          <span className="text-[9px] font-black uppercase opacity-60">{label}</span>
       </div>
       <span className="text-2xl font-black tracking-tighter">{value}</span>
    </div>
  );
}

function SummaryBadge({ icon, label, value, isDanger }) {
  return (
    <div className={`flex items-center gap-4 border-4 border-black px-6 py-4 font-black shadow-[6px_6px_0px_#000] ${isDanger ? 'bg-red-600 text-white' : 'bg-white text-black'} hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all`}>
       <div className="p-2 border-2 border-current bg-white/10">
         {icon}
       </div>
       <div className="flex flex-col">
          <p className="text-xs font-black uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-2xl font-black">{value}</p>
       </div>
    </div>
  );
}

function ResultCard({ data }) {
  return (
    <div className={`bento-cell bg-white transition-transform hover:scale-[1.02] p-5 ${data.has_cycle ? 'border-danger bg-red-50' : 'border-black'}`}>
       <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 flex items-center justify-center text-xl font-black border-4 border-black shadow-[4px_4px_0px_#000] ${data.has_cycle ? 'bg-danger text-white' : 'bg-accent text-black'}`}>
                {data.root}
             </div>
             <div className="leading-none">
               <h4 className="text-2xl font-black">{data.root}</h4>
               <p className="text-[10px] font-black uppercase mt-1 opacity-50">NODE_GROUP</p>
             </div>
          </div>
          {data.has_cycle ? (
             <div className="p-1 px-3 bg-danger text-white border-2 border-black font-black text-[10px]">CYCLE</div>
          ) : (
             <div className="p-1 px-3 bg-secondary text-black border-2 border-black font-black text-[10px]">DEPTH: {data.depth}</div>
          )}
       </div>
       <div className="mt-4">
          {data.has_cycle ? (
             <div className="p-4 bg-black text-red-500 font-mono text-[10px] border-2 border-red-500">
                &gt; ERROR: RECURSIVE LOOP IN COMPONENT_{data.root}<br/>
                &gt; UNABLE TO GENERATE TREE SCHEMATIC
             </div>
          ) : (
             <pre className="text-xs p-4 bg-slate-100 border-2 border-black font-semibold shadow-inner">
                {JSON.stringify(data.tree, null, 2)}
             </pre>
          )}
       </div>
    </div>
  );
}

export default App;
