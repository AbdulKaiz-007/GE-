import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { FloatingThemeToggle } from '@/components/ThemeToggle'
import { SupabaseHealthCheck } from '@/components/SupabaseHealthCheck'
export const metadata: Metadata = {
    title: 'DUOSHINKI — Powered by Gamma Edison',
    description: 'Learn through AI-generated comic lessons and epic boss fights. Level up your knowledge.',
    keywords: ['AI learning', 'gamified education', 'comic lessons', 'boss fights', 'XP system'],
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/favicon.png',
    },
    openGraph: {
        title: 'DUOSHINKI',
        description: 'AI-Powered Gamified Learning Platform by Gamma Edison',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased">
                <ThemeProvider>
                    <SupabaseHealthCheck />
                    {children}
                    <FloatingThemeToggle />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#1a1a2e',
                                color: '#e2e8f0',
                                border: '1px solid #2a2a4a',
                                borderRadius: '12px',
                            },
                            success: {
                                iconTheme: { primary: '#22c55e', secondary: '#0a0a0f' },
                            },
                            error: {
                                iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' },
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    )
}

