import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!
)

export async function POST(req: Request) {
    try {
        // 🔥 UPDATED: now we also receive userId
        const { message, userId } = await req.json()

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            )
        }

        // =========================
        // FETCH PEOPLE + ITEMS
        // =========================

        const { data: peopleData } = await supabase
            .from("people")
            .select(`
                id,
                name,
                items (
                    id,
                    name
                )
            `)

        // =========================
        // FETCH CLIENTS + SPACES
        // =========================

        const { data: clientsData } = await supabase
            .from("clients")
            .select(`
                id,
                name,
                space_clients (
                    spaces (
                        id,
                        address
                    )
                )
            `)

        // =========================
        // BUILD AI CONTEXT
        // =========================

        const prompt = `
You are an AI assistant helping answer questions about database data.

Here is the grocery list data:

${JSON.stringify(peopleData, null, 2)}

Here is the clients and spaces data:

${JSON.stringify(clientsData, null, 2)}

Answer the user's question clearly and accurately.

Do not use markdown formatting.
Do not use asterisks.
Respond in plain readable text.

User question:
${message}
`

        // =========================
        // SAVE USER MESSAGE (NEW)
        // =========================

        await supabase.from("messages").insert({
            user_id: userId,
            role: "user",
            content: message
        })

        // =========================
        // GEMINI
        // =========================

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        })

        const result = await model.generateContent(prompt)

        const response = result.response.text()

        // =========================
        // SAVE AI RESPONSE (NEW)
        // =========================

        await supabase.from("messages").insert({
            user_id: userId,
            role: "ai",
            content: response
        })

        return NextResponse.json({
            reply: response
        })

    } catch (error) {
        console.error("Gemini API error:", error)

        return NextResponse.json(
            { error: "AI request failed" },
            { status: 500 }
        )
    }
}