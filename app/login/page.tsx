"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation";
import Link from "next/link";

import { NetworkBackground } from "@/components/NetworkBackground";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    async function handleSignup() {
        if (!email || !password) {
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                localStorage.setItem("refrax-token", data.token)
                router.push(`/chat`);
            } else {
                setIsSuccess(false);
            }
        } catch (err) {
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-center items-center relative overflow-hidden">
            <NetworkBackground />

            <Link href="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 z-50 group">
                <span className="font-semibold text-xl tracking-tight text-neutral-500">RepoAsContext</span>
            </Link>

            <div className="bg-card border border-border-dim rounded-2xl w-full max-w-md p-8 md:p-10 relative z-10 shadow-2xl mx-4">
                <h2 className="text-3xl font-medium tracking-tight mb-2">Welcome back</h2>
                <p className="text-muted-grey font-light text-[15px] mb-8">Sign in to query your codebase.</p>

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
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[13px] font-medium text-[#c4c7c5] block">Password</label>
                        </div>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-accent-bg border border-border-dim rounded-lg p-3 text-[15px] text-white focus:outline-none focus:border-[#606060] transition-colors placeholder:text-[#444]"
                        />
                    </div>

                    <button
                        onClick={handleSignup}
                        disabled={isLoading}
                        className={`w-full bg-foreground text-background font-medium rounded-lg py-3 mt-4 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e3e3e3] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="text-center mt-4 text-[14px] text-muted-grey">
                        Don't have an account? <Link href="/signup" className="text-white hover:text-[#6bb28b] hover:underline transition-all">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}