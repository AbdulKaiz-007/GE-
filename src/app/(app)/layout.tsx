import XMBNav from '@/components/XMBNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen w-full bg-arc-bg overflow-x-hidden">
            <XMBNav />
            <main className="w-full pb-48">
                {children}
            </main>

            {/* Particle Dust Overlay for App */}
            <div className="particle-container">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="particle animate-particle-dust"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${10 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
