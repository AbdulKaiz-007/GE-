/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                sony: {
                    nebula: {
                        deep: '#000000',
                        light: '#001A3D',
                    },
                    violet: '#9D00FF',
                    indigo: '#4B00FF',
                    aura: 'rgba(0, 150, 255, 0.4)',
                    glass: 'rgba(255, 255, 255, 0.05)',
                },
                arc: {
                    bg: '#000000',
                    surface: '#000814',
                    card: 'rgba(255, 255, 255, 0.03)',
                    border: 'rgba(255, 255, 255, 0.1)',
                    text: '#F8FAFC',
                    muted: '#64748B',
                    primary: '#9D00FF',
                    neon: '#00E5FF',
                }
            },
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
                display: ['Orbitron', 'sans-serif'],
                hardware: ['Orbitron', 'sans-serif'],
            },
            backgroundImage: {
                'midnight-nebula': 'linear-gradient(to bottom, #000000, #001A3D)',
                'liquid-ribbon': 'linear-gradient(90deg, transparent, #9D00FF, #4B00FF, transparent)',
            },
            boxShadow: {
                'aura': '0 0 30px 5px rgba(0, 150, 255, 0.3)',
                'aura-hover': '0 0 50px 10px rgba(0, 150, 255, 0.5)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
            },
            animation: {
                'liquid-flow': 'liquidFlow 20s linear infinite',
                'particle-dust': 'particleDust 10s ease-in-out infinite',
                'pulsate': 'pulsate 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'glitch': 'glitch 2s steps(2) infinite',
                'motion-blur-in': 'motionBlurIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            },
            keyframes: {
                liquidFlow: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                particleDust: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
                    '50%': { transform: 'translate(20px, -20px) scale(1.1)', opacity: '0.6' },
                },
                pulsate: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.8', boxShadow: '0 0 20px rgba(0, 150, 255, 0.3)' },
                    '50%': { transform: 'scale(1.05)', opacity: '1', boxShadow: '0 0 40px rgba(0, 150, 255, 0.6)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glitch: {
                    '0%, 100%': { transform: 'translate(0)' },
                    '20%': { transform: 'translate(-2px, 2px)' },
                    '40%': { transform: 'translate(2px, -2px)' },
                    '60%': { transform: 'translate(-1px, 1px)' },
                    '80%': { transform: 'translate(1px, -1px)' },
                },
                motionBlurIn: {
                    '0%': { transform: 'scale(1.1) translateY(20px)', opacity: '0', filter: 'blur(10px)' },
                    '100%': { transform: 'scale(1) translateY(0)', opacity: '1', filter: 'blur(0)' },
                }
            },
        },
    },
    plugins: [],
}
