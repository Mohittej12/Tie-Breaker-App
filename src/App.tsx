import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Table as TableIcon, 
  ShieldAlert, 
  Send, 
  Loader2, 
  Trophy, 
  AlertTriangle, 
  Lightbulb, 
  Skull,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { analyzeDecision, AnalysisType, AnalysisResult } from './services/geminiService.ts';

type ViewMode = AnalysisType;

export default function App() {
  const [decision, setDecision] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ data: AnalysisResult; type: AnalysisType } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(AnalysisType.PROS_CONS);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;

    setIsLoading(true);
    try {
      const data = await analyzeDecision(decision, viewMode);
      setResult({ data, type: viewMode });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (!result) return null;

    const { data, type } = result;

    switch (type) {
      case AnalysisType.PROS_CONS:
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-600 font-bold">
                <Trophy size={14} /> Pros
              </h3>
              <div className="space-y-3">
                {data.content?.pros?.map((pro: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg group"
                  >
                    <p className="text-sm font-medium text-emerald-900">{pro.point}</p>
                    <span className={`mt-2 inline-block text-[10px] font-bold uppercase py-0.5 px-2 rounded-full ${
                      pro.impact === 'High' ? 'bg-emerald-200 text-emerald-800' : 
                      pro.impact === 'Medium' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {pro.impact} Impact
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-rose-600 font-bold">
                <AlertTriangle size={14} /> Cons
              </h3>
              <div className="space-y-3">
                {data.content?.cons?.map((con: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-4 bg-rose-50 border border-rose-100 rounded-lg"
                  >
                    <p className="text-sm font-medium text-rose-900">{con.point}</p>
                    <span className={`mt-2 inline-block text-[10px] font-bold uppercase py-0.5 px-2 rounded-full ${
                      con.impact === 'High' ? 'bg-rose-200 text-rose-800' : 
                      con.impact === 'Medium' ? 'bg-rose-100 text-rose-700' : 
                      'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {con.impact} Impact
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case AnalysisType.COMPARISON_TABLE:
        return (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 border-bottom border-gray-200">
                    <th className="p-4 font-mono text-xs uppercase tracking-wider text-gray-500 border-r border-gray-200">Attribute</th>
                    {data.content?.options?.map((opt: any, i: number) => (
                      <th key={i} className="p-4 font-semibold text-gray-900 border-r border-gray-200 last:border-r-0 min-w-[200px]">
                        {opt.name}
                      </th>
                    ))}
                 </tr>
               </thead>
               <tbody>
                  {data.content?.attributes?.map((attr: string, i: number) => (
                    <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-600 bg-gray-50/30 border-r border-gray-200">{attr}</td>
                      {data.content?.options?.map((opt: any, j: number) => (
                        <td key={j} className="p-4 text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
                          {opt.values?.[i]}
                        </td>
                      ))}
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        );

      case AnalysisType.SWOT:
        const swotItems = [
          { label: 'Strengths', key: 'strengths', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Weaknesses', key: 'weaknesses', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Opportunities', key: 'opportunities', icon: Lightbulb, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Threats', key: 'threats', icon: Skull, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
        ];
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            {swotItems.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={item.key} 
                className={`p-6 rounded-2xl border ${item.border} ${item.bg}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <item.icon className={item.color} size={18} />
                  <h3 className={`font-bold tracking-tight ${item.color}`}>{item.label}</h3>
                </div>
                <ul className="space-y-2">
                  {data.content?.[item.key]?.map((point: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-800">
                      <span className="opacity-40">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen technical-grid">
      {/* Navigation Rail / Header */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold rotate-12">TB</div>
            <h1 className="font-display italic text-xl font-medium tracking-tight">Tie Breaker</h1>
          </div>
          <div className="hidden sm:flex gap-6">
            <a href="#" className="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">History</a>
            <a href="#" className="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">Settings</a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mb-4 leading-[1.1]">
              Make every decision <span className="font-display italic font-light text-blue-600">with precision.</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Facing a crossroads? Let AI break the tie by analyzing your options through different strategic lenses.
            </p>
          </motion.div>
        </div>

        {/* Input Card */}
        <section className="mb-16">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-8">
              <div className="space-y-3">
                <label className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400 block ml-1">
                  The Decision Scenario
                </label>
                <textarea 
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  placeholder="Should I start a new freelance business or stay in my corporate job? Consider finances, work-life balance, and long-term growth..."
                  className="w-full h-40 p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder:text-gray-400 resize-none leading-relaxed"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { id: AnalysisType.PROS_CONS, label: 'Pros & Cons', icon: Scale },
                  { id: AnalysisType.COMPARISON_TABLE, label: 'Comparison', icon: TableIcon },
                  { id: AnalysisType.SWOT, label: 'SWOT Analysis', icon: ShieldAlert },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      viewMode === mode.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{mode.label}</span>
                    <mode.icon size={18} opacity={viewMode === mode.id ? 1 : 0.5} />
                  </button>
                ))}
              </div>

              <button 
                disabled={isLoading || !decision.trim()}
                className="w-full bg-gray-900 text-white h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Generate Strategic Analysis</span>
                    <Send size={18} className="translate-y-px group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Results Area */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.section 
              ref={resultsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8 pb-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 pb-8">
                <div className="space-y-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Analysis Strategy: {result.type.replace('_', ' ')}
                  </span>
                  <h2 className="text-3xl font-semibold tracking-tight text-gray-900">{result.data.title}</h2>
                  <p className="text-gray-500 max-w-2xl leading-relaxed">{result.data.summary}</p>
                </div>
                <button 
                   onClick={() => window.print()}
                   className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ArrowRight size={14} className="rotate-[-45deg]" /> Save as Report
                </button>
              </div>

              <div className="mt-8">
                {renderContent()}
              </div>

              <div className="mt-12 p-8 bg-gray-50 border border-gray-200 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                   <h4 className="font-mono text-[11px] uppercase tracking-widest text-gray-500 font-bold">Recommendation Focus</h4>
                </div>
                <p className="text-gray-700 italic border-l-2 border-blue-500 pl-6 leading-relaxed">
                  Based on the balance of factors above, prioritize the options that minimize "Critical" risks while aligning with your long-term scalability. The strategic weight suggests that immediate action may yield...
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-40">
            <Scale size={16} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Tie Breaker System v1.0</span>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 text-center sm:text-right leading-relaxed">
            Powered by Gemini Intelligence • Data processed locally in session • 2024
          </div>
        </div>
      </footer>
    </div>
  );
}
