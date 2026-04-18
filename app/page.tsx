"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Arimo } from 'next/font/google';
import { ThemeToggle } from "@/components/ThemeToggle";
import { NetworkBackground } from "@/components/NetworkBackground";

const RScript = Arimo({
    subsets: ['latin'],
    weight: '400',
    display: 'swap',
});


const MOCK_QUESTIONS_ROW_1 = [
    { text: "How does the GitHub repository viewer fetch files?", answer: "It uses the GitHub REST API (specifically the Octokit SDK) to fetch repository trees and blob contents securely.", img: "https://i.pravatar.cc/150?u=1" },
    { text: "Explain the email-based OTP verification flow.", answer: "When a user signs up, a 6-digit OTP is generated and sent via email. The session requires successful validation of this OTP before returning a JWT token.", img: "https://i.pravatar.cc/150?u=2" },
    { text: "Where is the Gemini LLM integration located?", answer: "The Gemini integration is handled in the chatController, which connects user prompts and selected GitHub file contents to the Gemini 2.5 Flash model.", img: "https://i.pravatar.cc/150?u=3" },
    { text: "Find the Next.js App Router configuration.", answer: "The App Router logic is located in the top-level app/ directory, utilizing page.tsx and layout.tsx definitions for routing.", img: "https://i.pravatar.cc/150?u=4" },
    { text: "How is the PostgreSQL connection pooled?", answer: "The backend uses the pg package connected to an Express instance, allowing connection pooling for efficient concurrent database queries.", img: "https://i.pravatar.cc/150?u=5" },
];

const MOCK_QUESTIONS_ROW_2 = [
    { text: "Are there any leaked secrets in the backend code?", answer: "No, all sensitive variables like the GitHub token or database URI are securely stored as environment variables and never committed to version control.", img: "https://i.pravatar.cc/150?u=6" },
    { text: "Why is the file injection context failing?", answer: "It fails if the requested string exceeds the token limits of the Gemini model or if the GitHub API rate limits the request. The application restricts the file size injected.", img: "https://i.pravatar.cc/150?u=7" },
    { text: "Summarize the user authentication implementation.", answer: "The authentication combines an initial password check with an email OTP step. Verified sessions are maintained using JWTs in the frontend's local storage.", img: "https://i.pravatar.cc/150?u=8" },
    { text: "Trace the OTP verification failure in the logs.", answer: "OTP failures usually map to user input mismatch or an expired token. The logs display 'Invalid OTP' while securely obfuscating the actual key.", img: "https://i.pravatar.cc/150?u=9" },
    { text: "Generate unit tests for the chat generation route.", answer: "You can use Jest or Supertest to mock the Gemini model responses, ensuring the endpoint handles successful responses and unexpected timeouts properly.", img: "https://i.pravatar.cc/150?u=10" },
];

function Pill({ q, onClick }: { q: { text: string; answer?: string; img: string }, onClick?: () => void }) {
    return (
        <div onClick={onClick} className="flex items-center gap-3 bg-card border border-border-dim px-4 py-2.5 rounded-full shrink-0 shadow-sm hover:bg-accent-bg cursor-pointer transition-colors">
            <img src={q.img} alt="Avatar" className="w-6 h-6 rounded-full opacity-80" />
            <span className="text-foreground font-light tracking-wide text-[15px]">{q.text}</span>
        </div>
    );
}

export default function Home() {
    const [selectedQuestion, setSelectedQuestion] = useState<{ text: string; answer?: string; img: string } | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedQuestion(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    return (
        <main className={`min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary-green/20 ${RScript.className}`}>
            <NetworkBackground />

            {/* Modal */}
            {selectedQuestion && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer transition-opacity" onClick={() => setSelectedQuestion(null)} />
                    <div className="bg-card border border-border-dim w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col">
                        <div className="p-6 border-b border-border-dim/50 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={selectedQuestion.img} alt="Avatar" className="w-8 h-8 rounded-full" />
                                    <span className="text-foreground font-medium text-[15px]">User Query</span>
                                </div>
                                <button onClick={() => setSelectedQuestion(null)} className="text-muted-grey hover:text-foreground cursor-pointer">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <div className="text-foreground text-[16px] leading-relaxed font-light">
                                {selectedQuestion.text}
                            </div>
                        </div>
                        <div className="p-6 bg-accent-bg/50">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-foreground font-medium text-[15px]">RepoAsContext Bot</span>
                            </div>
                            <div className="text-foreground/90 text-[15px] leading-[1.6]">
                                {selectedQuestion.answer}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Hanging Dark Mega-Menu Header */}
            <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-8 pointer-events-none">
                <header className="w-full max-w-[800px] bg-card/60 backdrop-blur-xl pointer-events-auto rounded-2xl h-[72px] flex items-center justify-between px-6 shadow-[0_10px_40px_rgba(0,0,0,0.2)] relative">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        {/* <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center rotate-45 shrink-0 scale-75">
                            <div className="w-2 h-2 bg-background rounded-full"></div>
                        </div> */}
                        <span className="font-medium text-lg tracking-tight text-foreground font-medium">RepoAsContext</span>
                    </Link>

                    {/* Center Links & Mega Menu */}


                    {/* Right Auth Block */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/login" className="hidden sm:block transition-all delay-100 duration-300 text-[13px] font-bold uppercase tracking-widest text-muted-grey hover:text-foreground">
                            LOG IN
                        </Link>
                        <Link href="/login" className="bg-card border border-border-dim transition-all delay-100 duration-300 hover:border-primary-green hover:bg-accent-bg text-foreground text-[12px] font-bold uppercase tracking-[0.05em] px-5 py-2.5 rounded-lg flex items-center">
                            GET STARTED
                        </Link>
                        <ThemeToggle />
                    </div>

                </header>
            </div>

            {/* Standard Hero Section */}
            <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-12 z-10">

                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `radial-gradient(circle 500px at 50% 200px, var(--muted-grey), transparent)`,
                    }}
                />

                <div className="relative z-10 flex flex-col items-center mt-[-5vh] pt-16">
                    <h1 className="text-[58px] sm:text-[80px] md:text-[70px] leading-[1.05] tracking-tight text-foreground max-w-[900px]">
                        Query Public<br /> <span className="text-neutral-500">Repositories</span> with<span className={`text-muted-foreground`}> <br />your prompts</span> <br />
                    </h1>
                    <p className="mt-8 text-[20px] text-muted-grey font-light max-w-lg leading-relaxed" style={{ transitionDelay: "100ms" }}>
                        Inject GitHub repository files directly into LLM prompts and unlock smarter, context-aware outputs.
                    </p>
                    <Link href="/login" className="mt-12" style={{ transitionDelay: "200ms" }}>
                        <div className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-transparent border border-border-dim text-foreground text-[15px] font-medium rounded-full overflow-hidden hover:border-muted-foreground bg-background/50 backdrop-blur-sm cursor-pointer hover:bg-foreground hover:text-background transition-all delay-100 duration-300">
                            Explore the App
                        </div>
                    </Link>

                    {/* Scroll Down Chevron */}
                    <div className="absolute -bottom-32 flex flex-col items-center opacity-50 text-muted-grey">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </section>

            {/* Scrolling Pills Section */}
            <section className="relative w-full py-24 overflow-hidden z-20 bg-background">
                {/* Fade edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>

                <div className="flex flex-col gap-5 relative opacity-80" style={{ transitionDelay: "300ms" }}>
                    {/* Row 1 */}
                    <div className="flex w-max shrink-0 animate-marquee-left gap-5 pr-5 h-14 text-2xl hover:[animation-play-state:paused]">
                        {[...MOCK_QUESTIONS_ROW_1, ...MOCK_QUESTIONS_ROW_1, ...MOCK_QUESTIONS_ROW_1].map((q, i) => (
                            <Pill key={`r1-${i}`} q={q} onClick={() => setSelectedQuestion(q)} />
                        ))}
                    </div>
                    {/* Row 2 */}
                    <div className="flex w-max shrink-0 animate-marquee-right gap-5 pr-5 -ml-40 h-14 text-2xl hover:[animation-play-state:paused]">
                        {[...MOCK_QUESTIONS_ROW_2, ...MOCK_QUESTIONS_ROW_2, ...MOCK_QUESTIONS_ROW_2].map((q, i) => (
                            <Pill key={`r2-${i}`} q={q} onClick={() => setSelectedQuestion(q)} />
                        ))}
                    </div>
                    {/* Row 3 */}
                    <div className="flex w-max shrink-0 animate-marquee-left gap-5 pr-5 h-14 text-2xl hover:[animation-play-state:paused]">
                        {[...MOCK_QUESTIONS_ROW_1, ...MOCK_QUESTIONS_ROW_1, ...MOCK_QUESTIONS_ROW_1].map((q, i) => (
                            <Pill key={`r3-${i}`} q={q} onClick={() => setSelectedQuestion(q)} />
                        ))}
                    </div>
                </div>
            </section>

            {/* BENTO GRID SECTIONS */}
            <section className="w-full max-w-[1100px] mx-auto py-20 px-6 flex flex-col gap-8 relative z-30">
                <div className="max-w-full mb-16">
                    <h2 className="text-[48px] sm:text-[64px] font-medium leading-[1.1] text-center tracking-tight flex justify-center items-center">
                        Instantly add files from  <br />repositories to your conversations.
                    </h2>
                    <p className="mt-6 text-[18px] text-muted-grey font-light flex justify-center items-center">
                        Add multiple files as a context to your conversations and get smarter response.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Bento 1: Advanced Context */}
                    <div className=" bg-card border border-border-dim rounded-3xl p-10 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-medium tracking-tight mb-3">Contextual Search</h3>
                        <p className="text-muted-grey font-light text-[15px] mb-8">Including complex codebase AST parsing</p>

                        <div className="bg-background border border-border-dim rounded-xl p-5 w-full text-left font-mono text-sm overflow-hidden flex flex-col gap-1 text-muted-grey">
                            <div><span className="text-primary-green">const</span> {"{"} GoogleGenerativeAI {"}"} <span className="text-primary-green">=</span> <span className="text-blue-400">require('@google/generative-ai');</span>;</div>
                            <div className="mt-2 text-foreground">const <span className="text-blue-400">chat</span> = <span className="text-primary-green">model</span> startChat(</div>
                            <div className="pl-4">history: history,</div>
                            <div className="pl-4">generationConfig: <span className="text-blue-400">maxOutputTokens: 8192</span></div>
                            <div>);</div>
                            <div className="mt-2 opacity-50">// Mapping 12 dependencies...</div>
                        </div>
                    </div>

                    {/* Bento 2: Smart interpretation */}
                    <div className=" bg-card border border-border-dim rounded-3xl p-10 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-medium tracking-tight mb-3">Smart interpretation</h3>
                        <p className="text-muted-grey font-light text-[15px] mb-8">Clearly states assumptions and caveats</p>

                        <div className="flex gap-4 w-full h-full pb-4">
                            <div className="bg-accent-bg shadow-inner rounded-xl p-4 flex-1 text-left flex flex-col relative overflow-hidden backdrop-blur-md border border-white/5">
                                <p className="text-[12px] leading-relaxed text-muted-grey font-light z-10 relative">The bot only considers changes merged into <span className="text-foreground">`main`</span> within the last 30 days.</p>
                                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary-green blur-[40px] opacity-20"></div>
                            </div>
                            <div className="bg-accent-bg shadow-inner rounded-xl p-4 flex-1 text-left flex flex-col relative overflow-hidden backdrop-blur-md border border-white/5">
                                <svg className="text-primary-green mb-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                <p className="text-[12px] leading-relaxed text-muted-grey font-light z-10 relative">External submodules are skipped to prevent hallucinated imports.</p>
                            </div>
                        </div>
                    </div>

                    {/* Bento 3: Learns over time */}
                    <div className=" bg-card border border-border-dim rounded-3xl p-10 flex flex-col items-center text-center h-[380px]">
                        <h3 className="text-2xl font-medium tracking-tight mb-3">Learns over time</h3>
                        <p className="text-muted-grey font-light text-[15px] mb-8">Improves with every question</p>

                        <div className="w-full max-w-[280px] flex flex-col gap-4 mx-auto mt-4">
                            <div className="flex items-center gap-4 opacity-100">
                                <svg className="w-5 h-5 text-primary-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>
                                <div className="h-2.5 rounded-full w-full bg-accent-bg border border-border-dim"></div>
                            </div>
                            <div className="flex items-center gap-4 opacity-40">
                                <div className="w-5 h-5 rounded-full border border-border-dim shrink-0"></div>
                                <div className="h-2.5 rounded-full w-[80%] bg-accent-bg border border-border-dim"></div>
                            </div>
                            <div className="flex items-center gap-4 opacity-20">
                                <div className="w-5 h-5 rounded-full border border-border-dim shrink-0"></div>
                                <div className="h-2.5 rounded-full w-[90%] bg-accent-bg border border-border-dim"></div>
                            </div>
                        </div>
                    </div>

                    {/* Bento 4: Works with Slack */}
                    <div className=" bg-card border border-border-dim rounded-3xl p-10 flex flex-col items-center text-center overflow-hidden h-[380px]">
                        <h3 className="text-2xl font-medium tracking-tight mb-3">Works with Slack</h3>
                        <p className="text-muted-grey font-light text-[15px] mb-8">Get fast answers from our Slackbot</p>

                        <div className="bg-accent-bg border border-border-dim rounded-t-xl w-full flex-1 p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col text-left text-sm mt-4 translate-y-2">
                            <div className="font-medium text-[15px] mb-4 text-foreground">#engineering-questions</div>

                            <div className="flex gap-3 mb-4">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_8cCCE7E0L4GbbXn9MyInPSJmEb1gjNDO4A&s" className="w-7 h-7 rounded-md" />
                                <div>
                                    <div className="font-medium text-foreground mb-0.5 text-[13px]">Vipul Dubey</div>
                                    <div className="text-[13px] text-muted-grey"><span className="text-blue-400">@RepoAsContext</span> Where is the auth token stored dynamically?</div>
                                    <span className="text-[9px] bg-border-dim px-1 py-1 rounded tracking-wide mr-2">./app/chat</span>
                                    <span className="text-[9px] bg-border-dim px-1 py-1 rounded tracking-wide">./components/authProvider</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-7 h-7 bg-foreground rounded-md animate-spin [animation-duration:2s] flex items-center justify-center rotate-45 shrink-0 scale-75 mt-1">
                                    <div className="w-2 h-2 bg-background rounded-full"></div>
                                </div>
                                <div>
                                    <div className="font-medium text-foreground mb-0.5 text-[13px] flex items-center gap-2">RAC Bot</div>
                                    <div className="text-[13px] text-muted-grey leading-relaxed">It is securely stored in local storage and managed via the NextJS <code className="text-blue-400 bg-border-dim/50 px-1 rounded">authProvider.tsx</code> context chunk.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Embed Section */}
            <section className="w-full py-28 flex flex-col items-center text-center px-4 relative bg-background">
                <div className="max-w-[800px] mb-16">
                    <h2 className="text-[48px] sm:text-[64px] font-medium leading-[1.1] tracking-tight">
                        Modern <br /> Tech Stack
                    </h2>
                    <p className="mt-6 text-[18px] text-muted-grey font-light">
                        Powered by Next.js, Node.js, Postgres, and Google Gemini AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1100px] px-6 relative z-30">
                    <div className="bg-card border border-border-dim rounded-3xl p-12 flex flex-col items-center hover:bg-accent-bg cursor-pointer group transition-all delay-100 duration-200">
                        <h3 className="text-2xl font-medium tracking-tight mb-3 group-hover:text-foreground">GitHub API Integration</h3>
                        <p className="text-muted-grey font-light text-[15px] mb-12">Browse and inject files as LLM context</p>

                        <div className="w-[300px] h-[70px] border border-border-dim bg-accent-bg rounded flex items-center justify-center text-primary-green font-mono text-sm tracking-widest relative">
                            {/* Circuit nodes mock */}
                            <div className="absolute -left-2 top-2 w-1 h-1 bg-border-dim"></div>
                            <div className="absolute -left-2 top-4 w-1 h-1 bg-border-dim"></div>
                            <div className="absolute -left-2 top-6 w-1 h-1 bg-border-dim"></div>
                            <div className="text-[10px] text-muted-grey">{"api.github.com/repos/${owner}/${repo}"}</div>
                            {/* Dotted green line connecting to nothing */}
                            <div className="absolute -right-[60px] top-1/2 border-t-2 border-dotted border-primary-green/50 w-[58px]"></div>
                        </div>
                    </div>

                    <div className="bg-card border border-border-dim rounded-3xl p-12 flex flex-col items-center hover:bg-accent-bg cursor-pointer group">
                        <h3 className="text-2xl font-medium tracking-tight mb-3 group-hover:text-foreground">Secure Authentication</h3>
                        <p className="text-muted-grey font-light text-[15px] mb-12">Email-based OTP verification</p>

                        <div className="w-[120px] h-[70px] border border-border-dim bg-[#1a1a1a] rounded p-2 text-left relative flex flex-col gap-1.5 overflow-hidden">
                            <div className="flex gap-1 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#3a3a3a]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#3a3a3a]"></div>
                            </div>
                            <div className="h-1.5 bg-[#2d2e2f] w-3/4 rounded-full"></div>
                            <div className="h-[2px] w-full border-t border-dotted border-[#444] my-0.5"></div>
                            <div className="h-1.5 bg-primary-green w-1/2 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mid Feature Section - Thinks like an analyst */}
            <section className="w-full py-24 flex flex-col items-center text-center px-4 relative">

                <div className="max-w-[800px] mb-20 relative">
                    <h2 className="text-[56px] sm:text-[80px] font-medium leading-[1.1] tracking-tight">
                        <span className="text-primary-green relative inline-block">
                            RepoAsContext.
                            {/* Subtle glowing sparks behind refrax */}
                            <div className="absolute inset-0 bg-[#6bb28b] blur-[100px] opacity-80 z-0 rounded-full scale-[1.8] animate-pulse-subtle"></div>
                        </span> <br />
                        Thinks like <br /> an engineer
                    </h2>
                    <p className="mt-8 text-[20px] text-muted-grey font-light">
                        Our engine interprets your requests just like a senior engineer.
                    </p>
                </div>

                {/* Dashboard Mockup - Floating App Card */}
                <div className=" w-full max-w-[1100px] mx-auto relative z-30">
                    <div className="bg-background w-full rounded-2xl border border-border-dim shadow-xl flex overflow-hidden h-[600px] text-left">

                        {/* Left Sidebar Mockup */}
                        <aside className="w-[240px] h-full bg-card border-r border-border-dim flex-col shrink-0 hidden md:flex">
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-[17px] font-medium text-white select-none">RepoAsContext</span>
                            </div>
                            <div className="px-3 pb-2">
                                <div className="w-full bg-foreground text-background text-sm font-medium py-2.5 rounded-full flex items-center justify-center gap-2 shadow-sm">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    New Chat
                                </div>
                            </div>
                            <div className="flex-1 px-3 py-2 space-y-4">
                                <div>
                                    <div className="text-[11px] font-medium tracking-wide text-muted-grey uppercase px-2 mb-1 pl-3">Today</div>
                                    <div className="bg-accent-bg text-foreground font-medium text-sm px-3 py-[7px] rounded-lg">Stripe Webhook Bug</div>
                                    <div className="text-foreground/90 text-sm px-3 py-[7px] rounded-lg">Auth Flow Update</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-medium tracking-wide text-muted-grey uppercase px-2 mb-1 pl-3 mt-4">Previous 7 Days</div>
                                    <div className="text-foreground/90 text-sm px-3 py-[7px] rounded-lg">Postgres Connection</div>
                                </div>
                            </div>
                            <div className="p-3 border-t border-border-dim/50">
                                <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/90">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    Sign Out
                                </div>
                            </div>
                        </aside>

                        {/* Center Mockup */}
                        <main className="flex-1 flex flex-col h-full bg-background relative">
                            {/* Header */}
                            <header className="h-[56px] shrink-0 px-6 flex items-center justify-between border-b border-border-dim/50">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-4 rounded-full flex items-center p-0.5 bg-muted-grey/20">
                                            <div className="w-3 h-3 rounded-full bg-background transform translate-x-0" />
                                        </div>
                                        <span className="text-[14px] font-medium text-foreground flex items-center gap-2">Gemini 2.5 Flash</span>
                                    </div>
                                </div>
                            </header>

                            {/* Chat Area */}
                            <div className="flex-1 px-8 py-8 flex flex-col gap-6 relative overflow-hidden">
                                <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
                                    <div className="text-[13px] font-medium text-foreground/90 flex items-center gap-2">
                                        User <span className="text-muted-grey text-[10px]">•</span> <span className="text-muted-grey font-normal">2 mins ago</span>
                                    </div>
                                    <div className="text-foreground text-[15px] leading-[1.6]">Find the bug causing 500 errors in the payment webhook.</div>
                                </div>

                                <div className="bg-card border border-border-dim rounded-[16px] p-5 w-full max-w-2xl mx-auto flex flex-col gap-3 shadow-sm">
                                    <div className="text-[13px] font-medium text-foreground/90 flex items-center gap-2">
                                        Model <span className="text-muted-grey text-[10px]">•</span> <span className="text-muted-grey font-normal">Just now</span>
                                    </div>
                                    <div className="text-foreground text-[15px] leading-[1.6] space-y-4">
                                        <p>I tracked down the issue. In your <code className="bg-accent-bg px-1.5 py-0.5 rounded text-[13px]">stripeHandler.js</code> file, the exact exception occurs because the signature payload is parsed incorrectly.</p>
                                        <div className="bg-background border border-border-dim rounded-lg p-4 font-mono text-[13px] text-muted-grey mt-3">
                                            <div className="text-[#a8c7fa] mb-1">// stripeHandler.js: L45-48</div>
                                            <div className="text-[#f87171] mb-1 line-through">- const sig = req.headers['stripe-signature'];</div>
                                            <div className="text-primary-green">+ const sig = req.headers['x-stripe-signature'];</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Input box */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-10">
                                <div className="bg-card border border-border-dim rounded-[24px] shadow-sm">
                                    <div className="pl-5 pr-2 py-2 flex items-center justify-between min-h-[56px]">
                                        <div className="text-muted-grey text-[15px]">Start typing a prompt...</div>
                                        <div className="w-10 h-10 rounded-full bg-[#2d2e2f] flex items-center justify-center text-muted-grey">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Right Sidebar Mockup */}
                        <aside className="w-[300px] bg-card border-l border-border-dim h-full hidden lg:flex flex-col shrink-0 text-left shadow-xl">
                            <div className="h-[56px] border-b border-border-dim/50 flex items-center px-5 shrink-0">
                                <span className="text-[15px] font-medium text-foreground">Run settings</span>
                            </div>
                            <div className="flex-1 p-5 space-y-6">
                                <div className="bg-background rounded-xl border border-border-dim p-4 text-sm shadow-sm space-y-1.5">
                                    <h3 className="text-foreground font-medium mb-1">Gemini 2.5 Flash</h3>
                                    <p className="text-muted-grey text-[13px] leading-relaxed">
                                        Fast, versatile model combining broad intelligence with long context supporting up to max 8192 tokens.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-medium text-foreground/90">Repository Context</h3>
                                    <div className="space-y-2.5">
                                        <div>
                                            <label className="text-[11px] text-muted-grey uppercase tracking-wide px-1">Owner</label>
                                            <div className="w-full bg-background border border-border-dim text-foreground rounded-lg px-3 py-2 text-[14px]">refrax-ai</div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-muted-grey uppercase tracking-wide px-1">Repository Name</label>
                                            <div className="w-full bg-background border border-border-dim text-foreground rounded-lg px-3 py-2 text-[14px]">stripe-integration</div>
                                        </div>
                                        <div className="w-full bg-[#2d2e2f] text-foreground/50 font-medium py-2 rounded-lg text-sm text-center">Connected</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-border-dim/70 space-y-1.5">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="text-[14px] font-medium text-foreground/90">File Explorer</h3>
                                    </div>
                                    <div className="bg-background rounded-lg border border-border-dim p-1.5 text-[13px] space-y-0.5">
                                        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#3b82f6]/10 text-[#60a5fa] rounded-md">
                                            <span>🟨</span> stripeHandler.js
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1.5 text-foreground/90 hover:bg-[#2d2e2f] rounded-md">
                                            <span>📋</span> package.json
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1.5 text-foreground/90 hover:bg-[#2d2e2f] rounded-md">
                                            <span>📝</span> README.md
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className=" w-full py-24 flex flex-col items-center">
                <div className="text-muted-grey font-light text-[15px] mb-10 tracking-wide">
                    Works natively with your environment
                </div>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg> Next.js</div>
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg> PostgreSQL</div>
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg> GitHub</div>
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> Stripe</div>
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg> Node.js</div>
                </div>
            </section>

            {/* FINAL CTA & FOOTER */}
            <section className="w-full flex flex-col items-center pt-32 pb-16 bg-transparent relative overflow-hidden">
                <div className=" flex flex-col items-center text-center px-4 max-w-2xl mb-40">
                    <h2 className="text-[50px] font-medium tracking-tight leading-tight mb-4">
                        Start using RepoAsContext
                    </h2>
                    <p className="text-[20px] text-muted-grey font-light mb-10">
                        Get the answers you need, when it matters
                    </p>
                    <Link href="/login">
                        <div className="px-8 py-3 bg-transparent border border-border-dim text-foreground font-medium rounded-full transition-all hover:bg-foreground hover:text-background hover:border-foreground">
                            Get started
                        </div>
                    </Link>
                </div>

                <div className="w-full max-w-[1200px] px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-muted-grey text-[14px] items-start pb-8 border-b border-muted-grey/10">
                    {/* Brand / Logo */}
                    <div className="flex flex-col gap-2 col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 font-medium text-foreground/60 font-medium mb-1">
                            <div className="bg-[#ff6600] text-white w-5 h-5 flex items-center justify-center font-bold text-[12px] shrink-0">V</div>
                            <span>vipuldubey041@gmail.com</span>
                            {/* <span className="text-muted-grey">|</span> */}
                            {/* <span>RepoAsContext Inc</span> */}
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-foreground font-medium mb-1">Company</h4>
                        <Link href="#" className="hover:text-foreground transition-colors">Updates</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">About</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Status</Link>
                    </div>

                    {/* Links Column 2 */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-foreground font-medium mb-1">Legal</h4>
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                    </div>

                    {/* Links Column 3 */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-foreground font-medium mb-1">Contact</h4>
                        <a href="mailto:info@refrax.xyz" className="hover:text-foreground transition-colors">info@refrax.xyz</a>
                        <a href="https://twitter.com/refrax" className="hover:text-foreground transition-colors">@refrax.xyz</a>
                    </div>
                </div>
            </section>
        </main>
    );
}
