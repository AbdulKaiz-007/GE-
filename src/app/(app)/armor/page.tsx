import { Shirt, ShoppingBag, Coins, Layers, Zap, Star, Activity, ShoppingCart } from 'lucide-react'

export default function ArmorPage() {
    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 animate-motion-blur-in pb-32">
            {/* Header HUD */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/10 relative">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 biometric-frame flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-sony-violet/10 group-hover:bg-sony-violet/20 transition-colors" />
                        <Shirt className="w-10 h-10 text-sony-violet relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-sony-violet/20 via-transparent to-transparent opacity-50" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-sony-violet animate-pulse" />
                            <span className="font-display text-[10px] text-sony-violet tracking-[0.4em] uppercase opacity-70">Logistics Terminal v4.2</span>
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.2em] uppercase chromatic-text">THE ARMORY
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6 glass-card bg-black/40 px-6 py-4 border-white/10">
                    <div className="text-right">
                        <div className="text-[9px] font-display font-medium text-white/20 tracking-[0.3em] uppercase mb-1">AVAILABLE BALANCE</div>
                        <div className="text-2xl font-display text-arc-neon flex items-center gap-2 justify-end drop-shadow-glow">
                            <Coins className="w-5 h-5" /> 2,450
                        </div>
                    </div>
                </div>
            </div>

            {/* Marketplace Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { id: 1, name: 'Ancient Calculus Tome', condition: 'Battle-worn', price: 50, color: 'sony-violet' },
                    { id: 2, name: 'Neural Link Mask', condition: 'Pristine', price: 120, color: 'arc-neon' },
                    { id: 3, name: 'Gravity Core Boots', condition: 'Prototype', price: 500, color: 'sony-indigo' },
                    { id: 4, name: 'Solar Flare Mantle', condition: 'Legendary', price: 950, color: 'sony-violet' },
                ].map((item) => (
                    <div key={item.id} className="glass-card group hover:border-white/30 transition-all duration-500 relative flex flex-col h-full bg-white/[0.02]">
                        <div className="p-1">
                            <div className="h-56 bg-sony-nebula-deep w-full biometric-frame flex items-center justify-center relative overflow-hidden group-hover:scale-[0.98] transition-transform">
                                <ShoppingBag className="w-16 h-16 text-white/5 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                                {/* Scanline effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline pointer-events-none" />

                                <div className="absolute bottom-4 left-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}`} />
                                        <span className="text-[8px] font-display text-white/40 tracking-widest uppercase">{item.condition}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-display text-white tracking-widest leading-relaxed uppercase group-hover:text-arc-neon transition-colors">{item.name}
                            </h3>

                            <div className="pt-4 mt-auto border-t border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-arc-neon font-display text-xl tracking-tighter">
                                    <Coins className="w-4 h-4" /> {item.price}
                                </div>
                                <button className="btn-hardware !px-6 !py-3">
                                    <span className="relative z-10 flex items-center gap-2 font-display text-[9px] tracking-widest uppercase">ACQUIRE
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Intel */}
            <div className="text-center mt-20 pt-12 border-t border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-gradient-to-r from-transparent via-sony-violet/40 to-transparent" />
                <p className="font-display text-[9px] text-white/10 tracking-[0.8em] uppercase animate-pulse">
                    New shipments materializing from the orbital docks...
                </p>
            </div>
        </div>
    )
}
