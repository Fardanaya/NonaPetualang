import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const limit = searchParams.get('limit') || '15'

    if (!query || query.length < 3) {
        return NextResponse.json({ data: { locations: [] } })
    }

    try {
        const response = await fetch(
            `https://api.weebdev.my.id/expedition/location?search=${encodeURIComponent(query)}&limit=${limit}`
        )
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Failed to fetch address suggestions:", error);
        return NextResponse.json(
            { error: 'Failed to fetch address suggestions' },
            { status: 500 }
        )
    }
}
