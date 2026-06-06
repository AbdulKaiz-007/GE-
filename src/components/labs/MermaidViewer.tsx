'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Maximize, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/game-engine'

interface MermaidViewerProps {
    chart: string
    className?: string
}

export default function MermaidViewer({ chart, className }: MermaidViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [svgContent, setSvgContent] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Orbitron, sans-serif',
            themeVariables: {
                primaryColor: 'rgba(0, 229, 255, 0.1)',
                primaryBorderColor: 'rgba(0, 229, 255, 0.5)',
                primaryTextColor: '#fff',
                lineColor: 'rgba(255, 255, 255, 0.2)',
                secondaryColor: 'rgba(168, 85, 247, 0.1)',
                tertiaryColor: 'rgba(0, 0, 0, 0.5)'
            }
        })

        const renderChart = async () => {
            try {
                // Ensure chart string is clean
                let cleanChart = chart.trim()
                if (cleanChart.startsWith('```mermaid')) {
                    cleanChart = cleanChart.replace(/```mermaid\n?/, '').replace(/```$/, '')
                }
                if (cleanChart.startsWith('```')) {
                    cleanChart = cleanChart.replace(/```\n?/, '').replace(/```$/, '')
                }

                const id = `mermaid-${Date.now()}`
                const { svg } = await mermaid.render(id, cleanChart)
                setSvgContent(svg)
                setError(null)
            } catch (err) {
                console.error("Mermaid Render Error", err)
                setError(err instanceof Error ? err.message : String(err))
            }
        }

        if (chart) {
            renderChart()
        }
    }, [chart])

    return (
        <div className={cn("relative w-full h-full flex flex-col group/viewer", className)}>
            {/* Controls HUD */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-50 group-hover/viewer:opacity-100 transition-opacity">
                <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="w-8 h-8 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-arc-neon hover:text-arc-neon transition-colors">
                    <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))} className="w-8 h-8 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-sony-indigo hover:text-sony-indigo transition-colors">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={() => setZoom(1)} className="w-8 h-8 glass-card bg-black/60 border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar relative flex items-center justify-center p-8 cursor-move">
                {error ? (
                    <div className="text-sony-violet/80 font-mono text-xs max-w-lg text-center border border-sony-violet/20 p-4 bg-sony-violet/5 rounded">
                        <p className="mb-2 uppercase font-bold">Failed to decrypt neural architecture:</p>
                        <p>{error}</p>
                    </div>
                ) : svgContent ? (
                    <div 
                        dangerouslySetInnerHTML={{ __html: svgContent }} 
                        className="transition-transform duration-200 ease-out origin-center"
                        style={{ transform: `scale(${zoom})` }}
                    />
                ) : (
                    <div className="animate-pulse text-arc-neon/50 font-display tracking-widest text-xs uppercase">Rendering Schematic...</div>
                )}
            </div>
        </div>
    )
}
