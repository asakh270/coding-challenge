import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const zip = searchParams.get("zip")

    if (!zip) {
        return NextResponse.json(
            { error: "ZIP code is required" },
            { status: 400 }
        )
    }

    try {
        // STEP 1: ZIP → LAT/LON (OpenStreetMap)
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=USA&format=json`,
            {
                headers: {
                    "User-Agent": "shabbat-times-app"
                }
            }
        )

        const geoData = await geoRes.json()

        if (!geoData || geoData.length === 0) {
            return NextResponse.json(
                { error: "Invalid ZIP code" },
                { status: 400 }
            )
        }

        const { lat, lon } = geoData[0]

        // STEP 2: FETCH SHABBAT TIMES (Hebcal)
        const today = new Date()
        const date = today.toISOString().split("T")[0]

        const hebcalRes = await fetch(
            `https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lon}&tzid=America/New_York&date=${date}`
        )

        const hebcalData = await hebcalRes.json()

        const items = hebcalData?.items || []

        // STEP 3: EXTRACT VALUES
        const candle = items.find(
            (item: any) => item.category === "candles"
        )

        const havdalah = items.find(
            (item: any) => item.category === "havdalah"
        )

        // STEP 4: RETURN CLEAN RESPONSE
        return NextResponse.json({
            candleLighting: candle?.title || "Not found",
            havdalah: havdalah?.title || "Not found"
        })

    } catch (error) {
        console.error("Shabbat API error:", error)

        return NextResponse.json(
            { error: "Failed to fetch Shabbat times" },
            { status: 500 }
        )
    }
}