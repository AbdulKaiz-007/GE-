'use client'

import { useState, useRef } from 'react'
import { Brain, FileText, Loader2, Target, CheckCircle2, ChevronRight, Zap, ListChecks, Download, UploadCloud, Layers, Sparkles } from 'lucide-react'
import { cn } from '@/lib/game-engine'
import toast from 'react-hot-toast'

interface QuestionGroup {
    marks: number;
    questions: string[];
}

type OracleMode = 'exam' | 'flashcards' | 'summary';

export default function ExamOraclePage() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [syllabusText, setSyllabusText] = useState('')
    const [mode, setMode] = useState<OracleMode>('exam')
    
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [selectedMarkers, setSelectedMarkers] = useState<number[]>([1, 2, 3, 5, 10])
    
    // Outputs
    const [generatedExam, setGeneratedExam] = useState<QuestionGroup[]>([])
    const [generatedFlashcards, setGeneratedFlashcards] = useState<{front: string, back: string}[]>([])
    const [generatedSummary, setGeneratedSummary] = useState<{title: string, bulletPoints: string[], keyTerms: string[]} | null>(null)

    const markers = [1, 2, 3, 5, 6, 10, 12]

    const toggleMarker = (marker: number) => {
        if (selectedMarkers.includes(marker)) {
            setSelectedMarkers(prev => prev.filter(m => m !== marker))
        } else {
            setSelectedMarkers(prev => [...prev, marker].sort((a, b) => a - b))
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/oracle/extract', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Extraction failed');
            
            setSyllabusText(data.text);
            toast.success('DOCUMENT EXTRACTED & SYNCED', { style: { background: '#001A3D', color: '#00E5FF' } });
        } catch (err: any) {
            toast.error(err.message || 'FAILED TO PARSE DOCUMENT', { style: { background: '#1A0000', color: '#FF0055' } });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    const handleGenerate = async () => {
        if (!syllabusText.trim()) {
            toast.error('PROVIDE SYLLABUS DATA TO INITIALIZE ORACLE')
            return
        }
        if (mode === 'exam' && selectedMarkers.length === 0) {
            toast.error('SELECT AT LEAST ONE MARKER PROTOCOL')
            return
        }

        setGenerating(true)
        setGeneratedExam([])
        setGeneratedFlashcards([])
        setGeneratedSummary(null)
        
        try {
            const response = await fetch('/api/oracle/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    context: syllabusText,
                    markers: mode === 'exam' ? selectedMarkers : [],
                    mode
                })
            })

            if (!response.ok) {
                throw new Error('ORACLE SYNTHESIS FAILED')
            }

            const data = await response.json()
            
            if (mode === 'exam') {
                const examArray: QuestionGroup[] = []
                Object.keys(data).forEach(key => {
                    const markVal = parseInt(key.split('_')[0])
                    if (!isNaN(markVal) && Array.isArray(data[key])) {
                        examArray.push({
                            marks: markVal,
                            questions: data[key]
                        })
                    }
                })
                setGeneratedExam(examArray.sort((a,b) => a.marks - b.marks))
            } else if (mode === 'flashcards') {
                setGeneratedFlashcards(data.flashcards || [])
            } else if (mode === 'summary') {
                setGeneratedSummary(data)
            }

            toast.success('PROTOCOL SYNTHESIS COMPLETE')
        } catch (error) {
            console.error('Oracle Error:', error)
            toast.error('ORACLE CORE OVERLOADED. RETRY SYNC.')
        } finally {
            setGenerating(false)
        }
    }

    const hasOutput = generatedExam.length > 0 || generatedFlashcards.length > 0 || generatedSummary !== null;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-motion-blur-in pb-32">
            {/* Header HUD */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 biometric-frame flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-arc-neon/10 group-hover:bg-arc-neon/20 transition-colors" />
                        <Brain className="w-10 h-10 text-arc-neon relative z-10 animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-t from-arc-neon/20 via-transparent to-transparent opacity-50" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-arc-neon animate-pulse" />
                            <span className="font-display text-[10px] text-arc-neon tracking-[0.4em] uppercase opacity-70">Predictive Algorithm v2.0</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] uppercase chromatic-text">EXAM ORACLE
                        </h1>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2 text-white/40">
                    <div className="text-[10px] font-display tracking-widest uppercase">
                        AI GENERATED ASSESSMENTS & INTEL
                    </div>
                    <div className="text-xs font-sans tracking-wide">
                        Powered by Llama-3.3-70b-Versatile
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border border-white/5 bg-black/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
                     <Target className="w-96 h-96 text-arc-neon animate-spin-slow" />
                </div>
                
                {/* Left Panel: Input Configuration */}
                <div className="lg:col-span-5 border-r border-white/5 relative z-10 bg-black/20 flex flex-col h-full">
                    
                    {/* Mode Selector */}
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3 mb-6">
                            <Layers className="w-4 h-4 text-sony-indigo" />
                            <h2 className="font-display text-sm tracking-[0.2em] text-white/70 uppercase">SELECT OUTPUT MODE</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-2 p-1 bg-black/60 border border-white/10 rounded-sm">
                            {(['exam', 'flashcards', 'summary'] as OracleMode[]).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "py-3 font-display text-[10px] tracking-widest uppercase transition-all rounded-sm",
                                        mode === m 
                                            ? "bg-sony-indigo/20 text-sony-indigo border border-sony-indigo/30 shadow-aura" 
                                            : "text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    {m === 'exam' ? 'EXAM' : m === 'flashcards' ? 'FLASHCARDS' : 'SUMMARY'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 space-y-10 flex-1">
                        {/* Step 1: Syllabus Input */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="w-8 h-8 rounded-full border border-arc-neon/40 flex items-center justify-center font-display text-arc-neon text-xs">01</div>
                                <h2 className="font-display text-lg tracking-[0.2em] text-white uppercase">INGEST CORE DATA</h2>
                            </div>
                            
                            {/* File Uploader */}
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "w-full h-24 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-sm bg-black/40",
                                    uploading ? "border-arc-neon/50 bg-arc-neon/5" : "border-white/20 hover:border-arc-neon/50 hover:bg-white/5"
                                )}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".pdf,.txt,.docx,.pptx"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <div className="flex items-center gap-3 text-arc-neon">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="font-display tracking-widest text-xs">UPLINKING FILE...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-white/40">
                                        <UploadCloud className="w-6 h-6 group-hover:text-arc-neon transition-colors" />
                                        <span className="font-display text-[10px] tracking-widest uppercase">Upload PDF, DOCX, PPTX</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-px flex-1 bg-white/10" />
                                <span className="font-display text-[10px] tracking-widest text-white/20 uppercase">OR PASTE TEXT</span>
                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            <textarea 
                                value={syllabusText}
                                onChange={(e) => setSyllabusText(e.target.value)}
                                placeholder="INITIALIZE DATA STREAM HERE..."
                                className="w-full h-48 bg-black/60 border border-white/10 rounded-sm p-4 text-white/80 font-mono text-sm focus:border-arc-neon/50 focus:ring-1 focus:ring-arc-neon/50 transition-all resize-none placeholder:text-white/10 placeholder:font-display placeholder:tracking-widest"
                            />
                            <div className="flex justify-between items-center text-[10px] font-display text-arc-neon uppercase tracking-widest">
                                <span>{syllabusText.length} BYTES DETECTED</span>
                                {syllabusText.length > 500 && <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> SUFFICIENT DATA</span>}
                            </div>
                        </div>

                        {/* Step 2: Marker Selection (ONLY FOR EXAM MODE) */}
                        <div className={cn("space-y-4 transition-opacity duration-300", mode !== 'exam' ? "opacity-30 pointer-events-none grayscale" : "opacity-100")}>
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="w-8 h-8 rounded-full border border-sony-violet/40 flex items-center justify-center font-display text-sony-violet text-xs">02</div>
                                <h2 className="font-display text-lg tracking-[0.2em] text-white uppercase">CALIBRATE MARKERS</h2>
                            </div>
                            <p className="text-sm font-sans text-white/40 leading-relaxed">
                                Adapts question complexity based on selected marks. (Exam Mode Only)
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {markers.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => toggleMarker(m)}
                                        disabled={mode !== 'exam'}
                                        className={cn(
                                            "w-12 h-12 border flex flex-col items-center justify-center transition-all duration-300 relative group overflow-hidden",
                                            selectedMarkers.includes(m) && mode === 'exam'
                                            ? "border-sony-violet bg-sony-violet/10 shadow-aura"
                                            : "border-white/10 bg-black/40 text-white/40 hover:border-white/30"
                                        )}
                                    >
                                        <span className={cn("font-display text-lg", selectedMarkers.includes(m) && mode === 'exam' ? "text-sony-violet drop-shadow-glow" : "text-white/40")}>{m}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 3: Generate Action */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !syllabusText.trim() || uploading}
                            className="btn-hardware w-full py-8 group mt-8 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-arc-neon/0 via-arc-neon/10 to-arc-neon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="flex items-center justify-center gap-4 relative z-10 transition-transform group-active:scale-95">
                                {generating ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-arc-neon" />
                                ) : (
                                    <Zap className="w-8 h-8 text-arc-neon group-hover:animate-shake" />
                                )}
                                <span className="font-display text-2xl tracking-[0.3em] uppercase">{generating ? 'SYNTHESIZING...' : 'INITIALIZE ORACLE'}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Panel: Output Generation */}
                <div className="lg:col-span-7 bg-black/60 relative z-10 flex flex-col min-h-[700px]">
                    
                    {!hasOutput && !generating ? (
                        <div className="flex items-center justify-center flex-1 p-12 text-center border-t lg:border-t-0 border-white/5">
                            <div className="space-y-6 opacity-30">
                                <FileText className="w-24 h-24 mx-auto text-white" />
                                <div className="font-display text-[10px] tracking-[0.5em] text-white uppercase">
                                    AWAITING DATA INGESTION
                                </div>
                            </div>
                        </div>
                    ) : generating ? (
                        <div className="flex flex-col items-center justify-center flex-1 p-12 space-y-8 border-t lg:border-t-0 border-white/5">
                            <div className="w-32 h-32 biometric-frame flex items-center justify-center relative">
                                <div className="absolute inset-0 border border-arc-neon rotate-45 animate-spin-slow"></div>
                                <div className="absolute inset-2 border border-sony-violet rotate-12 animate-spin-reverse-slow"></div>
                                <Brain className="w-12 h-12 text-arc-neon animate-pulse" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="font-display text-2xl tracking-[0.2em] text-arc-neon uppercase chromatic-text">STRUCTURING INTEL</h3>
                                <div className="flex items-center justify-center gap-2 text-white/40 font-mono text-xs">
                                    <Loader2 className="w-3 h-3 animate-spin inline" /> Aligning LLM Vectors
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full border-t lg:border-t-0 border-white/5">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-20">
                                <div className="flex items-center gap-3">
                                    <ListChecks className="w-5 h-5 text-arc-neon" />
                                    <h3 className="font-display text-xl tracking-[0.2em] text-white uppercase">{mode === 'exam' && 'EXAM PROTOCOL'}
                                        {mode === 'flashcards' && 'NEURAL FLASHCARDS'}
                                        {mode === 'summary' && 'EXECUTIVE SUMMARY'}
                                    </h3>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-arc-neon/40 transition-all font-display text-[10px] tracking-widest text-arc-neon uppercase">
                                    <Download className="w-3 h-3" /> EXPORT
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-12 overflow-y-auto flex-1 custom-scrollbar">
                                
                                {/* EXAM MODE RENDERING */}
                                {mode === 'exam' && generatedExam.map((group) => (
                                    <div key={group.marks} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                                            <div className="px-4 py-1.5 glass-card border-sony-violet/40 bg-sony-violet/10 font-display text-xs tracking-[0.3em] text-sony-violet uppercase flex items-center gap-3 shadow-glow">
                                                <Target className="w-4 h-4" /> {group.marks} MARKERS
                                            </div>
                                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                                        </div>
                                        
                                        <div className="space-y-4 pl-4 border-l border-white/10 font-sans">
                                            {group.questions.map((q, idx) => (
                                                <div key={idx} className="glass-card p-5 bg-white/[0.02] border-white/5 hover:border-white/20 transition-colors flex gap-4 group">
                                                    <span className="font-display text-white/20 tracking-widest">Q{idx + 1}.
                                                    </span>
                                                    <p className="text-white/80 leading-relaxed text-sm flex-1">
                                                        {q}
                                                    </p>
                                                    <span className="font-display text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">[{group.marks}M]
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* FLASHCARDS MODE RENDERING */}
                                {mode === 'flashcards' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {generatedFlashcards.map((card, idx) => (
                                            <div key={idx} className="group perspective-1000 h-64 cursor-pointer">
                                                <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
                                                    {/* Front */}
                                                    <div className="absolute inset-0 backface-hidden glass-card border-arc-neon/30 bg-black/60 p-6 flex flex-col justify-center text-center">
                                                        <span className="absolute top-4 left-4 font-display text-[10px] text-white/30 tracking-widest">CARD {idx + 1}</span>
                                                        <h3 className="text-lg font-sans text-white/90 leading-relaxed">{card.front}</h3>
                                                        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-display text-arc-neon tracking-widest opacity-50">
                                                            <Sparkles className="w-3 h-3" /> FLIP
                                                        </div>
                                                    </div>
                                                    {/* Back */}
                                                    <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card border-sony-indigo/30 bg-sony-indigo/10 p-6 flex flex-col inset-y overflow-y-auto">
                                                        <span className="mb-4 font-display text-[10px] text-sony-indigo tracking-widest uppercase">BACK / ANSWER</span>
                                                        <p className="text-sm font-sans text-white/80 leading-relaxed">{card.back}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SUMMARY MODE RENDERING */}
                                {mode === 'summary' && generatedSummary && (
                                    <div className="space-y-10 animate-motion-blur-in">
                                        <div className="text-center space-y-4">
                                            <h1 className="text-3xl md:text-5xl font-display tracking-[0.2em] text-white uppercase chromatic-text drop-shadow-glow">{generatedSummary.title}
                                            </h1>
                                            <div className="w-16 h-1 bg-arc-neon mx-auto rounded-full shadow-glow" />
                                        </div>

                                        <div className="glass-card p-8 border-sony-violet/20 bg-black/40">
                                            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                                <Target className="w-5 h-5 text-sony-violet" />
                                                <h3 className="font-display text-lg tracking-[0.2em] text-white uppercase">KEY TERMINOLOGY</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {generatedSummary.keyTerms.map((term, i) => (
                                                    <span key={i} className="px-3 py-1 bg-sony-violet/10 border border-sony-violet/40 text-sony-violet font-display text-[10px] tracking-widest uppercase rounded flex items-center gap-2 shadow-aura">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-sony-violet inline-block animate-pulse" />{term}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="glass-card p-8 border-arc-neon/20 bg-black/40">
                                            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                                <ListChecks className="w-5 h-5 text-arc-neon" />
                                                <h3 className="font-display text-lg tracking-[0.2em] text-white uppercase">EXECUTIVE SUMMARY</h3>
                                            </div>
                                            <ul className="space-y-4 font-sans text-white/80 leading-relaxed">
                                                {generatedSummary.bulletPoints.map((bp, i) => (
                                                    <li key={i} className="flex gap-4">
                                                        <div className="mt-1.5">
                                                            <div className="w-2 h-2 rounded-sm bg-arc-neon/60 rotate-45" />
                                                        </div>
                                                        <p className="flex-1">{bp}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-center pt-12 border-t border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-arc-neon/40 to-transparent" />
                <div className="flex items-center justify-center gap-4 text-[9px] font-display text-white/20 tracking-[0.6em] uppercase">
                    <Brain className="w-3 h-3" />
                    Powered by Gamma Edison Core
                </div>
            </div>
        </div>
    )
}
