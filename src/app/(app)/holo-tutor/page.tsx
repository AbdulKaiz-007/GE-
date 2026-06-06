'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Activity, ShieldAlert, ChevronRight, BookOpen, User, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { SecurityHandshake } from '@/components/SecurityHandshake'
import toast from 'react-hot-toast'

type Message = { role: 'user' | 'tutor', text: string }

type TutorState = {
  dialogue: string;
  emotion: string;
  choices: string[];
  avatarPrompt: string;
}

const PERSONAS = [
    { id: 'arc', name: 'ARC Instructor', desc: 'Default Sci-Fi Hologram', theme: 'futuristic holographic' },
    { id: 'stark', name: 'Tony Stark', desc: 'Marvel Universe', theme: 'Iron Man MCU high-tech laboratory holographic UI' },
    { id: 'batman', name: 'Batman', desc: 'DC Universe', theme: 'dark gritty batcave computer terminal' },
    { id: 'gojo', name: 'Gojo Satoru', desc: 'Anime Universe', theme: 'Jujutsu Kaisen anime style Infinity domain' },
    { id: 'yoda', name: 'Yoda', desc: 'Star Wars', theme: 'Jedi master hologram glowing blue transparent' }
]

function HoloTutorApp() {
    const [step, setStep] = useState<'upload' | 'persona' | 'novel'>('persona');
    const [pdfText, setPdfText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
    
    // Novel State
    const [history, setHistory] = useState<Message[]>([]);
    const [tutorState, setTutorState] = useState<TutorState | null>(null);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Dropzone
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            toast.loading('Decrypting knowledge matrix...', { id: 'pdf-upload' });
            const res = await fetch('/api/extract/pdf', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);
            
            setPdfText(data.text);
            toast.success('Zero-retention parse complete.', { id: 'pdf-upload' });
            
            handleTutorInteraction(data.text, [], "Initialize the lesson. Introduce yourself and ask me if I am ready.", selectedPersona.id);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to upload PDF.', { id: 'pdf-upload' });
        } finally {
            setLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    });

    const startUpload = (persona: typeof selectedPersona) => {
        setSelectedPersona(persona);
        setStep('upload');
    };

    const handleTutorInteraction = async (context: string, currentHistory: Message[], input: string, personaId?: string) => {
        setLoading(true);
        setStep('novel');
        setDisplayedText('');
        
        try {
            const res = await fetch('/api/tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    context, 
                    history: currentHistory, 
                    currentInput: input,
                    personaId: personaId || selectedPersona.id
                })
            });
            
            const state = await res.json();
            if (state.error) throw new Error(state.error);

            setTutorState(state);
            setHistory([...currentHistory, { role: 'user', text: input }]);
            
            // Typewriter effect
            setIsTyping(true);
            let i = 0;
            const textToType = state.dialogue;
            
            const timer = setInterval(() => {
                setDisplayedText((prev) => {
                    const nextContent = textToType.slice(0, i + 1);
                    if (i >= textToType.length - 1) {
                        clearInterval(timer);
                        setIsTyping(false);
                    }
                    i++;
                    return nextContent;
                });
            }, 30); // Typing speed

        } catch (error: any) {
            console.error(error);
            toast.error('Neural Link failed to generate dialogue.');
        } finally {
            setLoading(false);
        }
    };

    const handleChoiceClick = (choice: string) => {
        if (loading || isTyping) return;
        
        const updatedHistory = tutorState ? [...history, { role: 'tutor' as const, text: tutorState.dialogue }] : history;
        handleTutorInteraction(pdfText, updatedHistory, choice);
    };

    if (step === 'upload') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-sony-nebula-deep relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                
                <div className="max-w-2xl w-full glass-card p-12 border-arc-neon/30 text-center space-y-8 animate-motion-blur-in z-10">
                    <div className="space-y-4">
                       <h1 className="text-4xl font-display text-white tracking-[0.2em] uppercase chromatic-text">Holo-Tutor Sync</h1>
                       <p className="font-display text-[11px] text-white/50 tracking-[0.3em] uppercase max-w-lg mx-auto">
                           Zero-retention neural upload. Drop your PDF core to begin the interactive sequence.
                       </p>
                    </div>

                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed p-16 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-6 group rounded-xl ${
                            isDragActive ? 'border-arc-neon bg-arc-neon/10 scale-105' : 'border-white/20 bg-white/5 hover:border-arc-neon hover:bg-arc-neon/5'
                        }`}
                    >
                        <input {...getInputProps()} />
                        
                        {loading ? (
                            <>
                                <Activity className="w-12 h-12 text-arc-neon animate-pulse" />
                                <span className="font-display text-[10px] text-arc-neon tracking-[0.4em] uppercase animate-pulse">Decrypting Matrix...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-white/30 group-hover:text-arc-neon transition-colors" />
                                <div className="space-y-2">
                                    <p className="font-display text-sm tracking-widest uppercase text-white group-hover:text-arc-neon">
                                        {isDragActive ? 'Drop Data Core Here' : 'Select PDF Core'}
                                    </p>
                                    <p className="text-[10px] uppercase font-display tracking-[0.2em] text-white/40">Secure ephemeral processing. No data stored.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'persona') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-sony-nebula-deep relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                
                <div className="max-w-4xl w-full space-y-12 animate-motion-blur-in z-10">
                    <div className="text-center space-y-4">
                       <h1 className="text-4xl font-display text-white tracking-[0.2em] uppercase chromatic-text">Select Holographic Avatar</h1>
                       <p className="font-display text-[11px] text-white/50 tracking-[0.3em] uppercase max-w-lg mx-auto">
                           Choose a tutor persona. The simulation will adapt to their expertise and aesthetic.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PERSONAS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => startUpload(p)}
                                className="glass-card p-6 border-white/10 hover:border-arc-neon hover:bg-arc-neon/10 transition-all group flex flex-col items-center text-center space-y-4"
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-arc-neon flex items-center justify-center bg-black/40">
                                    <User className="w-8 h-8 text-white/50 group-hover:text-arc-neon transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-display tracking-[0.2em] text-white uppercase group-hover:text-arc-neon transition-colors">{p.name}</h3>
                                    <p className="text-[10px] uppercase font-display tracking-[0.1em] text-white/40 mt-2">{p.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-black flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none mix-blend-overlay z-50" />
            
            {/* Visual Novel Scene */}
            <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden glass-card border-white/10 animate-motion-blur-in shadow-2xl flex flex-col justify-end">
                
                {/* Dynamic Avatar Background/Prompt Image */}
                {tutorState && tutorState.avatarPrompt && (
                    <Image 
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(tutorState.avatarPrompt)}?width=1280&height=720&nologo=true`}
                        alt="Holo Tutor"
                        fill
                        className="object-cover absolute inset-0 opacity-70 scale-105 animate-pulse-slow object-top"
                        unoptimized
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                {/* Loading State Overlay */}
                {loading && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 glass-card bg-black/80 px-6 py-2 border-arc-neon rounded-full shadow-[0_0_15px_#00E5FF]">
                        <span className="font-display text-[9px] text-arc-neon tracking-widest uppercase flex items-center gap-3">
                            <Activity className="w-3 h-3 animate-spin-slow" /> Processing Neural Reply...
                        </span>
                    </div>
                )}

                {/* Interactive Choices (Floating above dialogue box) */}
                {!loading && !isTyping && tutorState?.choices && (
                    <div className="relative z-40 mb-6 px-12 flex flex-col gap-3 max-w-3xl mx-auto w-full items-end">
                        {tutorState.choices.map((choice, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleChoiceClick(choice)}
                                className="glass-card bg-black/80 border-white/20 hover:border-arc-neon hover:bg-arc-neon/10 px-6 py-3 text-right group transition-all"
                                style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}
                            >
                                <span className="font-display text-[11px] font-bold text-white uppercase tracking-widest group-hover:text-arc-neon group-hover:tracking-[0.15em] transition-all flex items-center justify-end gap-3">
                                    {choice} <ChevronRight className="w-4 h-4" />
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Dialogue Box */}
                <div className="relative z-30 w-full p-6 pb-8">
                    <div className="glass-card bg-black/90 border-t-2 border-l-2 border-white/20 p-8 pt-10 relative">
                        {/* Speaker Name */}
                        <div className="absolute -top-4 left-6 glass-card border-white/20 bg-black text-white px-8 py-2 font-display text-sm tracking-widest uppercase shadow-xl">
                            <span className="text-arc-neon">{selectedPersona.name}</span> [{tutorState?.emotion?.toUpperCase() || 'SYS'}]
                        </div>
                        
                        <div className="min-h-[100px]">
                            <p className="font-display text-[22px] md:text-2xl leading-relaxed tracking-wide text-white drop-shadow-xl h-full font-semibold">
                                {displayedText}
                                {isTyping && <span className="animate-pulse inline-block ml-1 w-3 h-6 bg-arc-neon opacity-70 translate-y-1" />}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HoloTutorPage() {
    return (
        <SecurityHandshake>
            <HoloTutorApp />
        </SecurityHandshake>
    )
}
