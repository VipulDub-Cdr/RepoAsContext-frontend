"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { NetworkBackground } from "@/components/NetworkBackground";

export default function OtpVerification() {
    const [otpInput, setOtpInput] = useState("");
    const [toaster, setToaster] = useState(false);
    const [toasterData, setToasterData] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    async function handleSubmit() {
        if (!otpInput) {
            setIsSuccess(false);
            setToasterData("Please enter the OTP.");
            setToaster(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp-verification`, {
                method: 'POST',
                headers: {
                    "CONTENT-TYPE": "application/json"
                },
                body: JSON.stringify({ email, otpInput })
            });

            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                router.push("/login");
            } else {
                setIsSuccess(false);
            }

            setToaster(true);
            setToasterData(data.message);
            setTimeout(() => {
                setToaster(false);
            }, 6000);
        } catch (err) {
            setIsSuccess(false);
            setToasterData("Failed to verify OTP.");
            setToaster(true);
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
                <span className="font-semibold text-xl tracking-tight text-[#f0f0f0]">Refrax</span>
            </Link>

            <div className="bg-card border border-border-dim rounded-2xl w-full max-w-md p-8 md:p-10 relative z-10 shadow-2xl mx-4 text-center">
                <div className="w-12 h-12 bg-accent-bg border border-border-dim rounded-xl flex items-center justify-center mx-auto mb-6 text-[#c4c7c5]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>

                <h2 className="text-3xl font-medium tracking-tight mb-2">Check your email</h2>
                <p className="text-muted-grey font-light text-[15px] mb-8">
                    We sent a verification code to <br />
                    <span className="font-medium text-white">{email || "your email"}</span>
                </p>

                {toaster && (
                    <div className={`mb-6 p-3 animate-pulse-subtle rounded-lg border text-sm text-center ${isSuccess ? 'bg-[#1a2e22] border-[#2e5c41] text-[#6bb28b]' : 'bg-[#2a1313] border-[#5c2e2e] text-[#f87171]'}`}>
                        {toasterData}
                    </div>
                )}

                <div className="flex flex-col gap-6 w-full text-left">
                    <div>
                        <label className="text-[13px] font-medium text-[#c4c7c5] mb-2 block text-center">Enter 6-digit Code</label>
                        <input
                            onChange={(e) => setOtpInput(e.target.value)}
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            className="w-full bg-accent-bg border border-border-dim rounded-lg p-4 text-[24px] text-center tracking-[0.5em] text-white focus:outline-none focus:border-[#606060] transition-colors placeholder:text-[#333]"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`w-full bg-foreground text-background font-medium rounded-lg py-3 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e3e3e3] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>

                    <div className="text-center text-[14px] text-muted-grey">
                        Didn't receive it? <span className="text-white hover:text-[#6bb28b] hover:underline transition-all cursor-pointer">Resend code</span>
                    </div>
                </div>
            </div>
        </div>
    )
}