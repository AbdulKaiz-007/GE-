import { NextRequest, NextResponse } from 'next/server';

/**
 * GoKwik Order Creation API
 * This route communicates with GoKwik's servers to initialize a transaction.
 */

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, planName, userId } = body;

        const appId = process.env.NEXT_PUBLIC_GOKWIK_APP_ID;
        const merchantSecret = process.env.GOKWIK_MERCHANT_SECRET;
        const isSandbox = process.env.GOKWIK_ENVIRONMENT !== 'production';

        // 1. Validate environment
        if (!appId || appId === 'your_gokwik_app_id_here') {
            // Mock response for development if no keys are set
            console.warn('--- GOKWIK MOCK MODE ACTIVE ---');
            return NextResponse.json({
                success: true,
                isMock: true,
                order_id: `MOCK_GK_${Date.now()}`,
                merchant_id: "ARC_STUDIOS_MOCK",
                request_id: `REQ_${Math.random().toString(36).substring(7)}`
            });
        }

        // 2. Real Integration Logic
        const gokwikUrl = isSandbox 
            ? 'https://sandbox.gokwik.co/v1/order/create'
            : 'https://api.gokwik.co/v1/order/create';

        // Note: You would typically generate a signature here using your merchantSecret
        // and add it to the headers.
        
        const response = await fetch(gokwikUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-App-Id': appId,
                // 'X-Gokwik-Signature': generatedSignature,
            },
            body: JSON.stringify({
                order_amount: amount,
                order_currency: 'INR',
                merchant_order_id: `ARC_${Date.now()}_${userId || 'anon'}`,
                // ... other GoKwik required fields (customer info, cart, etc.)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'GOKWIK_API_ERROR');
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('GOKWIK_ORDER_ERROR:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
