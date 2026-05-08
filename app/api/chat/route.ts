import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
    try {
        const { message, userId } = await req.json()

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            )
        }

        // =========================
        // INIT MODEL
        // =========================
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        })

        // =========================
        // FETCH APP DATA
        // =========================
        const { data: peopleData } = await supabase
            .from("people")
            .select(`id, name, items (id, name)`)

        const { data: clientsData } = await supabase
            .from("clients")
            .select(`id, name, space_clients (spaces (id, address))`)

        // =========================
        // FETCH MEMORIES
        // =========================
        const { data: existingMemories } = await supabase
            .from("memories")
            .select("id, memory")
            .eq("user_id", userId)
            .limit(20)
            .order("created_at", { ascending: true })

        // =========================
        // SELECT RELEVANT MEMORIES
        // =========================
        const memorySelectorPrompt = `
You are a memory selection system.

Select ONLY relevant memories for this question.

If none are relevant, return: NO_MEMORIES

MEMORIES:
${JSON.stringify(existingMemories, null, 2)}

USER QUESTION:
${message}
`

        const memorySelectorResult = await model.generateContent(memorySelectorPrompt)
        const selectedMemoriesText = memorySelectorResult.response.text().trim()

        const memoryContext =
            selectedMemoriesText === "NO_MEMORIES"
                ? ""
                : selectedMemoriesText

        // =========================
        // BUILD MAIN PROMPT
        // =========================
        const prompt = `
You are an AI assistant helping answer questions about database data.

INSTRUCTIONS:
Answer the user's question clearly and accurately.
Do not use markdown formatting.
Do not use asterisks.
Respond in plain readable text.

USER MEMORIES:
${memoryContext || "No relevant memories."}

GROCERY DATA:
${JSON.stringify(peopleData, null, 2)}

CLIENT DATA:
${JSON.stringify(clientsData, null, 2)}

Answer clearly and concisely.

User question:
${message}
`

        // =========================
        // SAVE USER MESSAGE
        // =========================
        await supabase.from("messages").insert({
            user_id: userId,
            role: "user",
            content: message
        })

        // =========================
        // GET AI RESPONSE
        // =========================
        const result = await model.generateContent(prompt)
        const response = result.response.text()

        // =========================
        // SAVE AI MESSAGE
        // =========================
        await supabase.from("messages").insert({
            user_id: userId,
            role: "ai",
            content: response
        })

        // =========================
        // MEMORY EXTRACTION
        // =========================
        const memoryPrompt = `
Extract only long-term useful user preferences.

Ignore:
- one-time questions
- factual lookups

User: ${message}
AI: ${response}

Return:
ONE sentence memory OR NO_MEMORY
`

        const memoryResult = await model.generateContent(memoryPrompt)
        const newMemory = memoryResult.response.text().trim()

        // =========================
        // MEMORY MERGE + DEDUP
        // =========================
        if (newMemory !== "NO_MEMORY") {

            const { data: memories } = await supabase
                .from("memories")
                .select("id, memory")
                .eq("user_id", userId)

            const memoryMergePrompt = `
You are a memory optimization system.

Merge the NEW memory with existing ones if similar.

Return ONLY ONE final memory sentence.

NEW MEMORY:
${newMemory}

EXISTING MEMORIES:
${JSON.stringify(memories, null, 2)}
`

            const mergeResult = await model.generateContent(memoryMergePrompt)
            const finalMemory = mergeResult.response.text().trim()

            const match = memories?.find((m) =>
                m.memory.toLowerCase().includes(finalMemory.toLowerCase()) ||
                finalMemory.toLowerCase().includes(m.memory.toLowerCase())
            )

            if (match) {
                await supabase
                    .from("memories")
                    .update({ memory: finalMemory })
                    .eq("id", match.id)
            } else {
                await supabase.from("memories").insert({
                    user_id: userId,
                    memory: finalMemory
                })
            }
        }

        // =========================
        // RETURN RESPONSE
        // =========================
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