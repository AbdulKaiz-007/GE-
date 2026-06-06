'use client'

import { Suspense } from 'react'
import BattlePageInner from './BattlePageInner'
import { Loader2 } from 'lucide-react'

export default function BattlePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-gb-darkest" />
                    <span className="font-display text-gb-darkest uppercase tracking-widest animate-blink">INITIALIZING...</span>
                </div>
            </div>
        }>
            <BattlePageInner />
        </Suspense>
    )
}
