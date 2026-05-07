import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!
)

export async function POST(req: Request) {
    try {
        // Get message from frontend
        const { message } = await req.json()

        // Select Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        })

        // Send message to Gemini
        const result = await model.generateContent(message)

        // Extract text response
        const response = result.response.text()

        // Return response to frontend
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
