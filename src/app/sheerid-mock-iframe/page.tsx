'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Shield } from 'lucide-react'

export default function SheerIDMockIframe() {
    const [step, setStep] = useState<'form' | 'loading' | 'success'>('form')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setStep('loading')

        setTimeout(() => {
            setStep('success')
            // Simulate SheerID's postMessage API to parent window
            window.parent.postMessage('sheerid-success', '*')
        }, 2000)
    }

    if (step === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4 font-sans text-white bg-transparent">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold">Verification Successful</h2>
                <p className="text-gray-400">Your student status has been confirmed.</p>
            </div>
        )
    }

    if (step === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4 font-sans text-white bg-transparent">
                <Loader2 className="w-12 h-12 text-[#c8ff00] animate-spin" />
                <p className="text-gray-400">Verifying credentials with academic databases...</p>
            </div>
        )
    }

    return (
        <div className="p-6 font-sans text-white bg-transparent max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-[#c8ff00]" />
                <h2 className="text-xl font-bold">Student Verification</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm text-gray-400 block">University / College</label>
                    <input
                        required
                        type="text"
                        placeholder="Search for your school..."
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#c8ff00] outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400 block">First Name</label>
                        <input required type="text" className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#c8ff00] outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400 block">Last Name</label>
                        <input required type="text" className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#c8ff00] outline-none" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400 block">Date of Birth</label>
                    <input required type="date" className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#c8ff00] outline-none [color-scheme:dark]" />
                </div>

                <div className="space-y-1">
                    <label className="text-sm text-gray-400 block">School Email Address</label>
                    <input required type="email" placeholder="student@university.edu" className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#c8ff00] outline-none" />
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#c8ff00] text-black font-bold rounded p-3 mt-4 hover:bg-[#a3cc00] transition-colors"
                >
                    Verify My Student Status
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Powered by <strong>SheerID (Mock Demo)</strong>
                </p>
            </form>
        </div>
    )
}
