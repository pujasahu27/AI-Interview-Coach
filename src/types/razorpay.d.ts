export {};

declare global {
  type RazorpayCheckoutResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  type RazorpayCheckoutOptions = {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
    handler: (response: RazorpayCheckoutResponse) => void;
    modal?: { ondismiss?: () => void };
  };

  type RazorpayCheckoutInstance = {
    open(): void;
  };

  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}
