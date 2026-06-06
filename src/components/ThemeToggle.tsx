'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

/* ─── Floating Pill Toggle (fixed, always-on-top) ──────────────────── */
export function FloatingThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <motion.div
            className="fixed bottom-6 right-6 z-[9999]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.5 }}
        >
            <button
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                className="relative group"
            >
                {/* Glow aura */}
                <motion.div
                    className="absolute inset-0 rounded-full blur-xl"
                    animate={{
                        background: isDark
                            ? 'radial-gradient(circle, rgba(0,229,255,0.5), transparent 70%)'
                            : 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)',
                        scale: [1, 1.3, 1],
                    }}
                    transition={{ scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
                />

                {/* Track */}
                <motion.div
                    className="relative w-[72px] h-[36px] rounded-full flex items-center px-1 overflow-hidden border"
                    animate={{
                        backgroundColor: isDark ? '#080818' : '#EEF2FF',
                        borderColor: isDark ? 'rgba(0,229,255,0.4)' : 'rgba(99,102,241,0.4)',
                        boxShadow: isDark
                            ? '0 0 20px rgba(0,229,255,0.25), inset 0 0 12px rgba(0,229,255,0.06)'
                            : '0 0 20px rgba(99,102,241,0.25), inset 0 0 12px rgba(99,102,241,0.06)',
                    }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Scanning line */}
                    <motion.div
                        className="absolute top-0 left-0 right-0 h-px"
                        animate={{
                            background: isDark
                                ? 'linear-gradient(90deg, transparent, #00E5FF, transparent)'
                                : 'linear-gradient(90deg, transparent, #6366F1, transparent)',
                            scaleX: [0, 1, 0],
                            x: ['-100%', '100%'],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Thumb */}
                    <motion.div
                        className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                        animate={{
                            x: isDark ? 0 : 36,
                            backgroundColor: isDark ? '#001A3D' : '#FFFFFF',
                            boxShadow: isDark
                                ? '0 0 12px rgba(0,229,255,0.8), 0 0 4px rgba(0,229,255,1)'
                                : '0 0 12px rgba(99,102,241,0.6), 0 0 4px rgba(99,102,241,0.8)',
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    >
                        <AnimatePresence mode="wait">
                            {isDark ? (
                                <motion.div
                                    key="moon"
                                    initial={{ rotate: -90, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    exit={{ rotate: 90, scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Moon className="w-3.5 h-3.5 text-cyan-300" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="sun"
                                    initial={{ rotate: 90, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    exit={{ rotate: -90, scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Sun className="w-3.5 h-3.5 text-indigo-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Background stars (dark) / sparkles (light) */}
                    {isDark ? (
                        <>
                            {[{ x: '65%', y: '25%', s: 1.5 }, { x: '75%', y: '65%', s: 1 }, { x: '58%', y: '55%', s: 2 }].map((dot, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-cyan-300"
                                    style={{ left: dot.x, top: dot.y, width: dot.s, height: dot.s }}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                                />
                            ))}
                        </>
                    ) : (
                        <>
                            {[{ x: '12%', y: '25%', s: 1.5 }, { x: '22%', y: '65%', s: 1 }, { x: '32%', y: '40%', s: 2 }].map((dot, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full bg-indigo-400"
                                    style={{ left: dot.x, top: dot.y, width: dot.s, height: dot.s }}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                                />
                            ))}
                        </>
                    )}
                </motion.div>

                {/* Label tooltip on hover */}
                <motion.div
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
                    initial={{ opacity: 0, x: 8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    style={{ opacity: 0 }}
                >
                    <div
                        className="px-2 py-1 rounded text-[10px] font-display tracking-widest uppercase border"
                        style={{
                            background: isDark ? '#080818' : '#FFFFFF',
                            borderColor: isDark ? 'rgba(0,229,255,0.3)' : 'rgba(99,102,241,0.3)',
                            color: isDark ? '#00E5FF' : '#6366F1',
                        }}
                    >
                        {isDark ? 'SWITCH TO LIGHT' : 'SWITCH TO DARK'}
                    </div>
                </motion.div>
            </button>
        </motion.div>
    )
}

/* ─── Sidebar compact toggle (for sidebar footer) ──────────────────── */
export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative flex items-center gap-3 w-full px-3 py-2.5 group overflow-hidden rounded-sm border"
            style={{
                background: isDark ? 'rgba(0,229,255,0.04)' : 'rgba(99,102,241,0.06)',
                borderColor: isDark ? 'rgba(0,229,255,0.15)' : 'rgba(99,102,241,0.2)',
            }}
        >
            {/* Hover shimmer */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                    background: isDark
                        ? 'linear-gradient(90deg, transparent, rgba(0,229,255,0.06), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.08), transparent)',
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Mini pill icon */}
            <div className="relative flex-shrink-0 w-9 h-5 rounded-full border flex items-center px-0.5"
                style={{
                    background: isDark ? '#001A3D' : '#EEF2FF',
                    borderColor: isDark ? 'rgba(0,229,255,0.4)' : 'rgba(99,102,241,0.4)',
                }}
            >
                <motion.div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    animate={{
                        x: isDark ? 0 : 16,
                        background: isDark ? '#00E5FF22' : '#6366F122',
                        boxShadow: isDark ? '0 0 6px rgba(0,229,255,0.8)' : '0 0 6px rgba(99,102,241,0.8)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                >
                    <AnimatePresence mode="wait">
                        {isDark ? (
                            <motion.div key="m" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                <Moon className="w-2.5 h-2.5 text-cyan-300" />
                            </motion.div>
                        ) : (
                            <motion.div key="s" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                                <Sun className="w-2.5 h-2.5 text-indigo-500" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {!collapsed && (
                <div className="flex flex-col leading-tight z-10">
                    <span className="font-display text-[9px] tracking-[0.25em] uppercase opacity-40">AESTHETIC</span>
                    <span
                        className="font-display text-[11px] tracking-widest uppercase"
                        style={{ color: isDark ? '#00E5FF' : '#6366F1' }}
                    >{isDark ? 'CYBER DARK' : 'HYPER LIGHT'}
                    </span>
                </div>
            )}
        </button>
    )
}
