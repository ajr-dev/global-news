import { NextResponse } from 'next/server';
import { getCountryNewsConfigs } from '@/types/news';

export async function GET(
    request: Request,
    { params }: { params: { country: string } }
) {
    try {
        const configs = await getCountryNewsConfigs();
        const country = params.country;
        const config = configs[country];
       
        if (!config) {
            return new NextResponse(`No news feed configuration found for ${country}`, { status: 404 });
        }

        const response = await fetch(config.url, {
            next: {
                revalidate: 60
            },
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`Upstream RSS feed returned status: ${response.status}`);
        }

        const data = await response.text();
       
        return new NextResponse(data, {
            headers: {
                'Content-Type': 'application/xml'
            }
        });
    } catch (error) {
        console.error('News fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error fetching news';
        return new NextResponse(errorMessage, { status: 500 });
    }
}