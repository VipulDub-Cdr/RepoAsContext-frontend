"use client"
import React, { useEffect, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastData {
    message: string;
    variant: ToastVariant;
}

interface ToasterProps {
    toast: ToastData | null;
    onDismiss: () => void;
    duration?: number; // ms, default 5000
}

const ICONS: Record<ToastVariant, React.ReactElement> = {
    success: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    error: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    info: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

const STYLES: Record<ToastVariant, { wrapper: string; icon: string; bar: string }> = {
    success: {
        wrapper: "bg-[#0d1f14] border border-[#2d5a3d] text-[#6ee7a0]",
        icon: "bg-[#1a3828] text-[#6ee7a0]",
        bar: "bg-[#6ee7a0]",
    },
    error: {
        wrapper: "bg-[#1f0d0d] border border-[#5a2d2d] text-[#f87171]",
        icon: "bg-[#381a1a] text-[#f87171]",
        bar: "bg-[#f87171]",
    },
    info: {
        wrapper: "bg-[#0d1525] border border-[#2d3f6e] text-[#93c5fd]",
        icon: "bg-[#1a2840] text-[#93c5fd]",
        bar: "bg-[#93c5fd]",
    },
};

export function Toaster({ toast, onDismiss, duration = 5000 }: ToasterProps) {
    const [visible, setVisible] = useState(false);
    const [progressWidth, setProgressWidth] = useState(100);

    useEffect(() => {
        if (!toast) {
            setVisible(false);
            return;
        }

        setVisible(false);
        setProgressWidth(100);

        // Trigger enter animation on next tick
        const enterTimer = setTimeout(() => setVisible(true), 10);

        // Progress bar animation
        const progressTimer = setTimeout(() => setProgressWidth(0), 50);

        // Auto-dismiss
        const dismissTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 350); // wait for exit animation
        }, duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(progressTimer);
            clearTimeout(dismissTimer);
        };
    }, [toast]);

    if (!toast) return null;

    const style = STYLES[toast.variant];

    return (
        <div
            className={`
                fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
                transition-all duration-350 ease-out
                ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}
            `}
            style={{ width: "min(440px, calc(100vw - 2rem))" }}
        >
            <div className={`relative rounded-xl shadow-2xl overflow-hidden ${style.wrapper}`}>
                {/* Progress bar */}
                <div
                    className={`absolute bottom-0 left-0 h-[2px] ${style.bar}`}
                    style={{
                        width: `${progressWidth}%`,
                        transition: `width ${duration - 100}ms linear`,
                    }}
                />

                <div className="flex items-start gap-3 px-4 py-3.5">
                    {/* Icon */}
                    <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${style.icon}`}>
                        {ICONS[toast.variant]}
                    </div>

                    {/* Message */}
                    <p className="flex-1 text-sm font-medium leading-snug pt-1">
                        {toast.message}
                    </p>

                    {/* Dismiss button */}
                    <button
                        onClick={() => {
                            setVisible(false);
                            setTimeout(onDismiss, 350);
                        }}
                        className="shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity"
                        aria-label="Dismiss"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Convenience hook
export function useToast() {
    const [toast, setToast] = useState<ToastData | null>(null);

    function showToast(message: string, variant: ToastVariant = "info") {
        setToast({ message, variant });
    }

    function dismissToast() {
        setToast(null);
    }

    return { toast, showToast, dismissToast };
}
