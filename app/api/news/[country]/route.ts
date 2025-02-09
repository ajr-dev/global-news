import { NextResponse } from 'next/server';
import { COUNTRY_NEWS_CONFIGS } from '@/types/news';

export async function GET(
    request: Request,
    { params }: { params: { country: string } }
) {
    const country = params.country;
    const config = COUNTRY_NEWS_CONFIGS[country];

    if (!config) {
        return new NextResponse('Country not supported', { status: 404 });
    }

    try {
        const response = await fetch(config.url);
        const data = await response.text();
        return new NextResponse(data, {
        headers: {
            'Content-Type': 'application/xml'
        }
        });
    } catch (error) {
        return new NextResponse('Error fetching news', { status: 500 });
    }
}