"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Chat = {
    id: string
    sender_id: string
    receiver_id: string
    message: string
}

export default function ChatPage() {
    const [session, setSession] = useState<any>(null)
    const [messages, setMessages] = useState<Chat[]>([])
    const [newMessage, setNewMessage] = useState("")

    // CHANGE THIS TO YOUR TEST USER (iCloud Acct)
    const mainAccountId = "a47269fa-5dd3-4918-9c14-bbbda803b1a3"
    const testerAccountId = "5449dadf-5aef-4bee-90fd-99e85f754ea1"

    // Dynamically pick the "other" person based on who is logged in
    const otherUserId = session?.user?.id === mainAccountId ? testerAccountId : mainAccountId;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })
    }, [])

    useEffect(() => {
        if (!session?.user?.id) return

        fetchMessages()

        const channel = supabase
            .channel("chat-room")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chats"
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Chat])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [session])

    async function fetchMessages() {
        const { data } = await supabase
            .from("chats")
            .select("*")
            .or(
                `and(sender_id.eq.${session.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${session.user.id})`
            )
            .order("created_at", { ascending: true })

        if (data) {
            setMessages(data)
        }
    }

    async function sendMessage() {
        if (!newMessage.trim()) return

        await supabase.from("chats").insert({
            sender_id: session.user.id,
            receiver_id: otherUserId,
            message: newMessage
        })

        setNewMessage("")
    }

    return (
        <div className="min-h-screen p-10 bg-gray-100">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold mb-6">
                    Live Chat
                </h1>

                <div className="space-y-3 h-[500px] overflow-y-auto mb-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-3 rounded-xl max-w-[80%] ${msg.sender_id === session?.user?.id
                                ? "bg-blue-600 text-white ml-auto"
                                : "bg-gray-200 text-black"
                                }`}
                        >
                            {msg.message}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type message..."
                        className="flex-1 border rounded-lg px-4 py-3"
                    />

                    <button
                        onClick={sendMessage}
                        className="bg-blue-600 text-white px-6 rounded-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
