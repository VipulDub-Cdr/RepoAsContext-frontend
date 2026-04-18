"use client"
import { useState } from "react"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Toaster, useToast } from "@/components/Toaster";

import { NetworkBackground } from "@/components/NetworkBackground";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast, showToast, dismissToast } = useToast();

    const router = useRouter();

    async function handleSignup() {
        if (!email || !password) {
            showToast("Please fill in all fields.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (data.success) {
                showToast(data.message || "Account created! Check your email.", "success");
                router.push(`/otp-verification?email=${encodeURIComponent(email)}`);
            } else {
                showToast(data.message || "Something went wrong. Please try again.", "error");
            }
        } catch (err) {
            showToast("Failed to connect to server. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-center items-center relative overflow-hidden">
            <NetworkBackground />

            <Link href="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 z-50 group">
                <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center rotate-45 shrink-0 scale-75 transition-transform group-hover:scale-90">
                    <div className="w-2 h-2 bg-[#0A0A0A] rounded-full"></div>
                </div>
                <span className="font-semibold text-xl tracking-tight text-[#f0f0f0]">RepoAsContext</span>
            </Link>

            <div className="bg-card border border-border-dim rounded-2xl w-full max-w-md p-8 md:p-10 relative z-10 shadow-2xl mx-4">
                <h2 className="text-3xl font-medium tracking-tight mb-2">Create an account</h2>
                <p className="text-muted-grey font-light text-[15px] mb-8">Join RepoAsContext to upgrade your workflow.</p>

                <div className="flex flex-col gap-5">
                    <div>
                        <label className="text-[13px] font-medium text-[#c4c7c5] mb-1.5 block">Email address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="you@example.com"
                            className="w-full bg-accent-bg border border-border-dim rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#606060] transition-colors placeholder:text-[#444]"
                        />
                    </div>

                    <div>
                        <label className="text-[13px] font-medium text-[#c4c7c5] mb-1.5 block">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Create a strong password"
                            className="w-full bg-accent-bg border border-border-dim rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#606060] transition-colors placeholder:text-[#444]"
                        />
                    </div>

                    <button
                        onClick={handleSignup}
                        disabled={isLoading}
                        className={`w-full bg-foreground text-background font-medium rounded-lg py-3 mt-4 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e3e3e3] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                    >
                        {isLoading ? 'Creating account...' : 'Sign Up'}
                    </button>

                    <div className="text-center mt-4 text-[14px] text-muted-grey">
                        Already have an account? <Link href="/login" className="text-white hover:text-[#6bb28b] hover:underline transition-all">Sign in</Link>
                    </div>
                </div>
            </div>

            <Toaster toast={toast} onDismiss={dismissToast} />
        </div>
    )
}