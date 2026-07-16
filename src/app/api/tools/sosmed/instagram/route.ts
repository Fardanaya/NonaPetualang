import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const query = searchParams.get('username_or_id');

    if (!query) {
        return NextResponse.json({ error: 'Missing username_or_id parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://api.weebdev.my.id/social/instagram/user?username_or_id=${query}&refresh=${forceRefresh}`,
            {
                headers: {
                    'Cache-Control': 'max-age=259200'
                },
                cache: forceRefresh ? 'no-cache' : 'force-cache',
                next: {
                    revalidate: 259200,
                    tags: [`instagram-server-${query.toLowerCase()}`]
                }
            }
        );

        if (!response.ok) {
            throw new Error(`WeebdevAPI error: ${response.status}`);
        }

        // todo: delete chaining_results & chaining_suggestions object from response
        const res = await response.json();

        const data = NextResponse.json({
            status: 200,
            message: 'Instagram Profile fetched successfully',
            data: {
                ...res.data,
                chaining_results: undefined,
                chaining_suggestions: undefined,
            },
        });

        return data;


    } catch (error) {
        console.error('Error fetching Instagram data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data from Instagram API' },
            { status: 500 }
        );
    }
}
