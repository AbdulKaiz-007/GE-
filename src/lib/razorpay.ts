export const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
            resolve(true)
        }
        script.onerror = () => {
            resolve(false)
        }
        document.body.appendChild(script)
    })
}

// Placeholder for future order creation
export const createOrder = async (amount: number) => {
    // This will eventually call your backend API
    console.log('Creating order for:', amount)
    return {
        id: 'order_placeholder_' + Date.now(),
        amount: amount * 100,
        currency: 'INR'
    }
}
