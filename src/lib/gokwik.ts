/**
 * GoKwik SDK Loader and Checkout Handler
 * ARC Studios Cognitive Engine
 */

export const loadGoKwik = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve(false);
        
        // If already loaded
        if ((window as any).gokwik) return resolve(true);

        const script = document.createElement('script');
        // Standard GoKwik SDK URL (v2)
        const env = process.env.GOKWIK_ENVIRONMENT || 'sandbox';
        script.src = env === 'production' 
            ? 'https://sdk.gokwik.co/v2/gokwik.js' 
            : 'https://sandbox.gokwik.co/v2/gokwik.js';
        
        script.id = 'gokwik-sdk';
        script.async = true;
        
        script.onload = () => {
            console.log('--- GOKWIK SDK LOADED ---');
            resolve(true);
        };
        
        script.onerror = () => {
            console.error('--- GOKWIK SDK LOAD FAILURE ---');
            resolve(false);
        };

        document.body.appendChild(script);
    });
};

export interface GoKwikOrderResponse {
    order_id: string;
    merchant_id: string;
    request_id: string;
    // Add other fields based on GoKwik's specific API response
}

/**
 * Initiates the GoKwik checkout modal
 */
export const initiateGoKwikCheckout = async (orderResponse: any) => {
    if (typeof window === 'undefined' || !(window as any).gokwik) {
        throw new Error('GOKWIK_SDK_NOT_LOADED');
    }

    return new Promise((resolve, reject) => {
        try {
            // Standard GoKwik initiation pattern
            // Note: The specific function name 'initiateCheckout' may vary by version
            (window as any).gokwik.initiateCheckout({
                orderResponse: orderResponse,
                onSuccess: (data: any) => {
                    console.log('GOKWIK_SUCCESS:', data);
                    resolve(data);
                },
                onFailure: (error: any) => {
                    console.error('GOKWIK_FAILURE:', error);
                    reject(error);
                },
                onCancel: () => {
                    console.warn('GOKWIK_CANCELLED');
                    reject(new Error('USER_CANCELLED'));
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};
