"use client"

import { useState } from "react"

type Message = {
    role: "user" | "ai"
    content: string
}

export default function AIAgentPage() {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!message.trim()) return

        // Save user message
        const userMessage: Message = {
            role: "user",
            content: message
        }

        setMessages((prev) => [...prev, userMessage])

        setLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message
                })
            })

            const data = await res.json()

            // Save AI response
            const aiMessage: Message = {
                role: "ai",
                content: data.reply
            }

            setMessages((prev) => [...prev, aiMessage])

        } catch (error) {
            console.error(error)

            const errorMessage: Message = {
                role: "ai",
                content: "Something went wrong."
            }

            setMessages((prev) => [...prev, errorMessage])

        } finally {
            setLoading(false)
            setMessage("")
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center p-10">

            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg flex flex-col p-6">

                <h1 className="text-3xl font-bold mb-6">
                    AI Agent
                </h1>

                {/* Chat Messages */}
                <div className="flex flex-col gap-4 mb-6 max-h-[500px] overflow-y-auto">

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl max-w-[80%] ${msg.role === "user"
                                ? "bg-blue-600 text-white self-end"
                                : "bg-gray-200 text-black self-start"
                                }`}
                        >
                            {msg.content}
                        </div>
                    ))}

                    {loading && (
                        <div className="bg-gray-200 text-black p-4 rounded-xl max-w-[80%] self-start">
                            Thinking...
                        </div>
                    )}

                </div>

                {/* Input Area */}
                <div className="flex gap-4">

                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask something..."
                        className="flex-1 border rounded-lg px-4 py-3"
                    />

                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Send
                    </button>

                </div>

            </div>

        </div>
    )
}