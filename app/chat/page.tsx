"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NetworkBackground } from "@/components/NetworkBackground"

// Types
type Session = {
    id: number
    title: string
    repo_owner: string | null
    repo_name: string | null
    created_at: string
}

type TreeItem = {
    path: string
    type: "blob" | "tree"
}

type StagedFile = {
    path: string
    content: string
}

type Message = {
    id: number
    role: "user" | "model" | "error"
    content: string
    context_files: string[]
}

export default function Chat() {
    // Session state
    const [sessions, setSessions] = useState<Session[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
    const [isLoadingSessions, setIsLoadingSessions] = useState(true)

    // Repo config state (per session)
    const [owner, setOwner] = useState("")
    const [repo, setRepo] = useState("")
    const [tree, setTree] = useState<TreeItem[]>([])
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
    const [isFetchingTree, setIsFetchingTree] = useState(false)
    const [loadingFilePath, setLoadingFilePath] = useState<string | null>(null)
    const [fetchError, setFetchError] = useState("")

    // Chat state
    const [prompt, setPrompt] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingHistory, setIsFetchingHistory] = useState(false)
    const [isTemporary, setIsTemporary] = useState(false)

    const router = useRouter()

    // UI state

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isLoading])

    // Load sessions on mount
    useEffect(() => {
        fetchSessions()
    }, [])

    async function fetchSessions() {
        try {
            const token = localStorage.getItem("refrax-token") || ""
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setSessions(data.sessions)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoadingSessions(false)
        }
    }

    // ── Explicit Navigation Handlers ────────────────────────────────────────

    function handleNewChat() {
        setCurrentSessionId(null)
        setMessages([])
        setOwner("")
        setRepo("")
        setTree([])
        setStagedFiles([])
        setFetchError("")
    }

    function handleSelectSession(id: number) {
        if (currentSessionId === id && !isTemporary) return
        setCurrentSessionId(id)
        setIsTemporary(false)
        loadSessionData(id)
    }

    function handleLogout() {
        localStorage.removeItem("refrax-token")
        router.push("/login")
    }

    async function loadSessionData(id: number) {
        setIsFetchingHistory(true)
        setTree([])
        setStagedFiles([])
        setFetchError("")
        try {
            // Find session config
            const session = sessions.find(s => s.id === id)
            if (session) {
                setOwner(session.repo_owner || "")
                setRepo(session.repo_name || "")
            }

            const token = localStorage.getItem("refrax-token") || ""
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                // Ensure context_files is parsed
                const parsedMessages = data.messages.map((m: any) => ({
                    ...m,
                    context_files: typeof m.context_files === 'string' ? JSON.parse(m.context_files) : m.context_files || []
                }))
                setMessages(parsedMessages)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsFetchingHistory(false)
        }
    }

    // ── Repo & Tree Functions ──────────────────────────────────────────────
    async function handleFetchTree() {
        if (!owner.trim() || !repo.trim()) return
        setIsFetchingTree(true)
        setFetchError("")
        setTree([])
        setStagedFiles([])

        try {
            const token = localStorage.getItem("refrax-token") || ""
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/get-tree`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ owner, repo })
            })
            const data = await res.json()
            if (!data.success) {
                setFetchError(data.error || "Failed to fetch repository.")
            } else {
                setTree(data.tree)
            }
        } catch {
            setFetchError("Network error fetching tree.")
        } finally {
            setIsFetchingTree(false)
        }
    }

    async function toggleFile(item: TreeItem) {
        if (item.type !== "blob") return

        const isStaged = stagedFiles.some(f => f.path === item.path)
        if (isStaged) {
            setStagedFiles(prev => prev.filter(f => f.path !== item.path))
            return
        }

        setLoadingFilePath(item.path)
        try {
            const token = localStorage.getItem("refrax-token") || ""
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/get-file`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ owner, repo, path: item.path })
            })
            const data = await res.json()
            if (data.success) {
                setStagedFiles(prev => [...prev, { path: data.path, content: data.content }])
            } else {
                alert(`Failed to fetch file: ${data.error}`)
            }
        } catch {
            alert("Network error fetching file content.")
        } finally {
            setLoadingFilePath(null)
        }
    }

    function unstageFile(path: string) {
        setStagedFiles(prev => prev.filter(f => f.path !== path))
    }

    // ── Sending Messages ────────────────────────────────────────────────────
    async function handleSubmit() {
        if (!prompt.trim() || isLoading) return
        setIsLoading(true)

        const currentPrompt = prompt
        setPrompt("")

        const token = localStorage.getItem("refrax-token") || ""
        let sessionId = currentSessionId

        // 1. Optimistic UI update
        const tempUserMsgId = Date.now()
        setMessages(prev => [...prev, {
            id: tempUserMsgId,
            role: "user",
            content: currentPrompt,
            context_files: stagedFiles.map(f => f.path)
        }])

        // 2. Create a session first if it doesn't exist and not temporary
        if (!isTemporary && !sessionId) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ repo_owner: owner, repo_name: repo })
                })
                const data = await res.json()
                if (data.success) {
                    sessionId = data.session.id
                    setCurrentSessionId(sessionId)
                    setSessions(prev => [data.session, ...prev])
                } else {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        role: "error",
                        content: data.error || "Failed to start a new chat session.",
                        context_files: []
                    }])
                    setIsLoading(false)
                    return
                }
            } catch {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: "error",
                    content: "Network error while creating session. Please check your connection.",
                    context_files: []
                }])
                setIsLoading(false)
                return
            }
        }

        // 3. Send message payload
        try {
            let res;
            if (isTemporary) {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/temporary-message`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        prompt: currentPrompt,
                        // Fix mapping to ignore error messages from being sent to Gemini
                        history: messages.filter(m => m.role !== 'error').map(m => ({ role: m.role, content: m.content })),
                        fileContexts: stagedFiles.map(f => ({ path: f.path, content: f.content }))
                    })
                })
            } else {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions/${sessionId}/message`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        prompt: currentPrompt,
                        fileContexts: stagedFiles.map(f => ({ path: f.path, content: f.content }))
                    })
                })
            }

            const data = await res.json()
            if (data.success) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 2,
                    role: "model",
                    content: data.response,
                    context_files: []
                }])

                // Refresh sessions to pick up auto-generated titles
                if (!isTemporary) fetchSessions()
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 2,
                    role: "error",
                    content: data.error || "Failed to get a response from the model.",
                    context_files: []
                }])
            }
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                role: "error",
                content: "Network error while requesting a response. Please try again later.",
                context_files: []
            }])
        } finally {
            setIsLoading(false)
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    async function deleteChat(id: number, e: React.MouseEvent) {
        e.stopPropagation()
        const confirmDelete = window.confirm("Delete this chat?")
        if (!confirmDelete) return

        try {
            const token = localStorage.getItem("refrax-token") || ""
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/sessions/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            setSessions(prev => prev.filter(s => s.id !== id))
            if (currentSessionId === id) {
                setCurrentSessionId(null)
            }
        } catch (error) {
            console.error("Failed to delete", error)
        }
    }

    // ── UI Helpers ──────────────────────────────────────────────────────────
    const blobs = tree.filter(i => i.type === "blob")
    const stagedPaths = new Set(stagedFiles.map(f => f.path))

    function fileName(path: string) { return path.split("/").pop() || path }
    function fileExt(path: string) {
        const name = fileName(path)
        const dot = name.lastIndexOf(".")
        return dot !== -1 ? name.slice(dot + 1).toLowerCase() : ""
    }

    const extIcons: Record<string, string> = {
        ts: "🟦", tsx: "🟦", js: "🟨", jsx: "🟨",
        py: "🐍", json: "📋", md: "📝", css: "🎨",
        html: "🌐", go: "🐹", rs: "🦀", java: "☕",
        sh: "🐚", yml: "⚙️", yaml: "⚙️", env: "🔒",
    }
    function fileIcon(path: string) { return extIcons[fileExt(path)] ?? "📄" }

    // Grouping for sidebar
    const today = new Date().toDateString()
    const todaySessions = sessions.filter(s => new Date(s.created_at).toDateString() === today)
    const olderSessions = sessions.filter(s => new Date(s.created_at).toDateString() !== today)

    // ── Main Layout ─────────────────────────────────────────────────────────
    return (
        <div className="w-screen h-screen flex bg-background text-foreground overflow-hidden font-sans relative">
            <NetworkBackground />

            {/* ─── Left Panel: Recents ──────────────────────────────────── */}
            <aside className="w-[260px] h-full bg-card border-r border-border-dim flex flex-col shrink-0">
                <div className="p-4 flex items-center justify-between pointer-events-none">
                    <span className="text-[17px] font-medium text-white select-none pointer-events-auto cursor-pointer" onClick={handleNewChat}>RepoAsContext</span>
                </div>

                <div className="px-3 pb-2">
                    <button
                        onClick={handleNewChat}
                        className="w-full bg-foreground hover:bg-[#e0e0e0] text-background text-sm font-medium py-2.5 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
                    {isLoadingSessions ? (
                        <div className="space-y-4 px-2 py-2">
                            <div className="space-y-2">
                                <div className="h-[11px] w-12 bg-[#2d2e2f] rounded animate-pulse mb-3"></div>
                                <div className="h-8 bg-[#2d2e2f] rounded-lg w-full animate-pulse"></div>
                                <div className="h-8 bg-[#2d2e2f] rounded-lg w-5/6 animate-pulse"></div>
                                <div className="h-8 bg-[#2d2e2f] rounded-lg w-full animate-pulse"></div>
                            </div>
                            <div className="space-y-2 pt-4">
                                <div className="h-[11px] w-20 bg-[#2d2e2f] rounded animate-pulse mb-3"></div>
                                <div className="h-8 bg-[#2d2e2f] rounded-lg w-4/6 animate-pulse"></div>
                                <div className="h-8 bg-[#2d2e2f] rounded-lg w-full animate-pulse"></div>
                                <div className="h-8 bg-[#2d2e2f] rounded-lg w-5/6 animate-pulse"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Today */}
                            {todaySessions.length > 0 && (
                                <div>
                                    <div className="text-[11px] font-medium tracking-wide text-muted-grey uppercase px-2 mb-1 pl-3">Today</div>
                                    <div className="space-y-0.5">
                                        {todaySessions.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => handleSelectSession(s.id)}
                                                className={`group relative text-sm px-3 py-[7px] rounded-lg cursor-pointer transition-colors ${currentSessionId === s.id ? "bg-accent-bg text-foreground font-medium" : "text-foreground/90 hover:bg-[#2d2e2f]"}`}
                                            >
                                                <div className="truncate pr-6">{s.title === 'New Chat' ? 'Untitled Chat' : s.title}</div>
                                                <button onClick={(e) => deleteChat(s.id, e)} className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 ${currentSessionId === s.id ? 'text-[#e8eaed] hover:text-foreground' : 'text-[#9aa0a6] hover:text-foreground'} cursor-pointer`}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Older */}
                            {olderSessions.length > 0 && (
                                <div>
                                    <div className="text-[11px] font-medium tracking-wide text-muted-grey uppercase px-2 mb-1 pl-3 mt-4">Previous 7 Days</div>
                                    <div className="space-y-0.5">
                                        {olderSessions.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => handleSelectSession(s.id)}
                                                className={`group relative text-sm px-3 py-[7px] rounded-lg cursor-pointer transition-colors ${currentSessionId === s.id ? "bg-accent-bg text-foreground font-medium" : "text-foreground/90 hover:bg-[#2d2e2f]"}`}
                                            >
                                                <div className="truncate pr-6">{s.title === 'New Chat' ? 'Untitled Chat' : s.title}</div>
                                                <button onClick={(e) => deleteChat(s.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#9aa0a6] hover:text-foreground cursor-pointer">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* User Info & Logout */}
                <div className="mt-auto p-3 border-t border-border-dim/50 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/90 hover:text-foreground hover:bg-[#2d2e2f] transition-colors cursor-pointer"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ─── Center Panel: Chat ─────────────────────────────────────── */}
            <main className="flex-1 flex flex-col h-full bg-background relative transition-all duration-300">
                {/* Header */}
                <header className="h-[56px] shrink-0 px-6 flex items-center justify-between border-b border-border-dim/50">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => {
                                setIsTemporary(!isTemporary)
                                if (!isTemporary) handleNewChat() // Going to temporary implies new blank chat
                            }}
                        >
                            <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${isTemporary ? 'bg-accent-bg' : 'bg-muted-grey/20'}`}>
                                <div className={`w-3 h-3 rounded-full bg-background transform transition-transform ${isTemporary ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-[14px] font-medium text-foreground flex items-center gap-2">
                                {isTemporary ? (
                                    <>Temporary chat <span className="text-muted-grey font-normal">• Your conversation won't be saved automatically</span></>
                                ) : "Gemini 2.5 Flash"}
                            </span>
                        </div>
                    </div>
                    <ThemeToggle />
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-[10%] xl:px-[15%] py-8 scrollbar-thin">
                    {isFetchingHistory ? (
                        <div className="space-y-8 pb-20 w-full max-w-4xl mx-auto px-4 animate-fade-in">
                            {/* Fake User Message */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-10 bg-[#2d2e2f] rounded animate-pulse"></div>
                                    <div className="h-3 w-16 bg-[#2d2e2f] rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-3 mt-1">
                                    <div className="h-4 w-[60%] bg-[#2d2e2f] rounded animate-pulse"></div>
                                    <div className="h-4 w-[40%] bg-[#2d2e2f] rounded animate-pulse"></div>
                                </div>
                            </div>

                            {/* Fake Model Message */}
                            <div className="bg-card border border-border-dim rounded-[16px] p-5 w-full flex flex-col gap-4 shadow-sm mt-3 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-12 bg-[#2d2e2f] rounded"></div>
                                    <div className="h-3 w-16 bg-[#2d2e2f] rounded"></div>
                                </div>
                                <div className="space-y-3 mt-1">
                                    <div className="h-4 w-[95%] bg-[#2d2e2f] rounded"></div>
                                    <div className="h-4 w-[90%] bg-[#2d2e2f] rounded"></div>
                                    <div className="h-4 w-[75%] bg-[#2d2e2f] rounded"></div>
                                </div>
                            </div>

                            {/* Fake User Message */}
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-10 bg-[#2d2e2f] rounded animate-pulse"></div>
                                    <div className="h-3 w-16 bg-[#2d2e2f] rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-3 mt-1">
                                    <div className="h-4 w-[50%] bg-[#2d2e2f] rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-5 animate-fade-in pb-20">
                            <h1 className="text-3xl font-medium text-foreground tracking-tight">What can I help you with?</h1>
                            <p className="text-[15px] text-muted-grey max-w-sm text-center">
                                Load a GitHub repository context in the side panel or start typing to begin coding.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-20 w-full max-w-4xl mx-auto px-4">
                            {messages.map((msg, i) => (
                                <div key={msg.id} className="w-full animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>

                                    {msg.role === "error" ? (
                                        <div className="flex items-center gap-2 text-[#f87171] text-[14px]">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            {msg.content}
                                        </div>
                                    ) : msg.role === "user" ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="text-[13px] font-medium text-foreground/90 flex items-center gap-2">
                                                User <span className="text-muted-grey text-[10px]">•</span> <span className="text-muted-grey font-normal">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>

                                            {/* Context Pills */}
                                            {msg.context_files && msg.context_files.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-1">
                                                    {msg.context_files.map(f => (
                                                        <span key={f} className="text-[11px] flex items-center gap-1.5 bg-card border border-border-dim text-foreground/90 px-2.5 py-1 rounded-md shadow-sm">
                                                            <span>{fileIcon(f)}</span>
                                                            <span className="truncate max-w-[150px]">{fileName(f)}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="text-foreground text-[15px] leading-[1.6] whitespace-pre-wrap">
                                                {msg.content}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-card border border-border-dim rounded-[16px] p-5 w-full flex flex-col gap-3 shadow-sm mt-3">
                                            <div className="text-[13px] font-medium text-foreground/90 flex items-center gap-2">
                                                Model <span className="text-muted-grey text-[10px]">•</span> <span className="text-muted-grey font-normal">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="text-foreground text-[15px] leading-[1.6] whitespace-pre-wrap">
                                                {msg.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="bg-card border border-border-dim px-5 py-4 rounded-[16px] flex gap-1.5 items-center shadow-sm h-[50px] mt-3">
                                        <div className="w-2 h-2 rounded-full bg-[#8e918f] animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                                        <div className="w-2 h-2 rounded-full bg-[#8e918f] animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                                        <div className="w-2 h-2 rounded-full bg-[#8e918f] animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-[10%] xl:px-[15%]">

                    {/* Floating staged pills */}
                    {stagedFiles.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2 animate-bounce-in">
                            {stagedFiles.map(f => (
                                <div key={f.path} className="flex items-center gap-1.5 bg-[#2d2e2f] border border-[#444746] text-foreground text-[13px] pl-3 pr-1 py-1 rounded-lg shadow-sm">
                                    <span>{fileIcon(f.path)}</span>
                                    <span className="max-w-[150px] truncate">{fileName(f.path)}</span>
                                    <button onClick={() => unstageFile(f.path)} className="text-muted-grey hover:text-foreground hover:bg-muted-grey/20 rounded p-0.5 ml-1 transition-colors cursor-pointer focus:outline-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input Box */}
                    <div className={`bg-card border rounded-[24px] shadow-sm transition-colors ${prompt ? 'border-[#444746]' : 'border-border-dim'}`}>
                        <div className="pl-5 pr-2 py-2 flex items-end min-h-[56px] relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                placeholder="Start typing a prompt, use alt + enter to append"
                                className="w-full bg-transparent text-foreground text-[15px] max-h-[200px] resize-none focus:outline-none py-3 scrollbar-thin placeholder-[#8e918f]"
                                rows={1}
                                style={{ fieldSizing: "content" } as any}
                            />
                            <div className="pb-1 pl-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !prompt.trim()}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${prompt.trim() && !isLoading
                                        ? 'bg-white text-black hover:bg-[#e0e0e0] scale-100'
                                        : 'bg-[#2d2e2f] text-muted-grey opacity-50 cursor-not-allowed scale-95'
                                        }`}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-2.5">
                        <span className="text-[11px] text-muted-grey">RepoAsContext can make mistakes. Verify important code.</span>
                    </div>
                </div>
            </main>

            {/* ─── Right Panel: Settings / Repo Config ─────────────────────── */}

            <aside className="w-[300px] bg-card border-l border-border-dim flex flex-col shrink-0 animate-fade-in shadow-xl z-10">
                <div className="h-[56px] border-b border-border-dim/50 flex items-center px-5 shrink-0">
                    <span className="text-[15px] font-medium text-foreground">Run settings</span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">

                    {/* Gemini Config Info Panel */}
                    <div className="bg-background rounded-xl border border-border-dim p-4 text-sm shadow-sm space-y-1.5">
                        <h3 className="text-foreground font-medium mb-1">Gemini 2.5 Flash</h3>
                        <p className="text-muted-grey text-[13px] leading-relaxed">
                            Fast, versatile model combining broad intelligence with long context supporting up to max 8192 tokens.
                        </p>
                    </div>

                    {/* Repo Config Box */}
                    <div className="space-y-3">
                        <h3 className="text-[14px] font-medium text-foreground/90">Repository Context</h3>
                        <div className="space-y-2.5">
                            <div>
                                <label className="text-[11px] text-muted-grey uppercase tracking-wide px-1">Owner</label>
                                <input
                                    type="text"
                                    value={owner}
                                    onChange={e => setOwner(e.target.value)}
                                    className="w-full bg-background border border-border-dim text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8e918f] transition-all"
                                    placeholder="octocat"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-muted-grey uppercase tracking-wide px-1">Repository Name</label>
                                <input
                                    type="text"
                                    value={repo}
                                    onChange={e => setRepo(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleFetchTree()}
                                    className="w-full bg-background border border-border-dim text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8e918f] transition-all"
                                    placeholder="Hello-World"
                                />
                            </div>
                            <button
                                onClick={handleFetchTree}
                                disabled={isFetchingTree || !owner || !repo}
                                className="w-full bg-[#2d2e2f] hover:bg-muted-grey/20 text-foreground font-medium py-2 rounded-lg text-sm transition-colors mt-1 disabled:opacity-50 cursor-pointer"
                            >
                                {isFetchingTree ? "Connecting..." : "Connect Repository"}
                            </button>
                            {fetchError && <p className="text-red-400 text-[12px]">{fetchError}</p>}
                        </div>
                    </div>

                    {/* File Tree Navigator */}
                    {tree.length > 0 && (
                        <div className="pt-2 border-t border-border-dim/70">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-[14px] font-medium text-foreground/90">File Explorer</h3>
                                <span className="text-[12px] bg-[#2d2e2f] text-foreground/90 px-2 py-[1px] rounded flex items-center">
                                    {stagedFiles.length} limit
                                </span>
                            </div>

                            <div className="space-y-0.5 bg-background rounded-lg border border-border-dim p-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
                                {blobs.map(item => {
                                    const staged = stagedPaths.has(item.path)
                                    const loading = loadingFilePath === item.path
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => toggleFile(item)}
                                            disabled={loading}
                                            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer group ${staged
                                                ? 'bg-[#3b82f6]/10 text-[#60a5fa]'
                                                : 'hover:bg-[#2d2e2f] text-foreground/90'
                                                }`}
                                        >
                                            <span>{loading ? "⏳" : fileIcon(item.path)}</span>
                                            <span className="truncate flex-1">{item.path}</span>
                                            {staged ? (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            ) : !loading && (
                                                <span className="opacity-0 group-hover:opacity-100 text-muted-grey text-[16px] leading-[0] mb-0.5">+</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    )
}
