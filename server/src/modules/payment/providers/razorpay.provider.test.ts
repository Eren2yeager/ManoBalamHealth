import crypto from "crypto";

const createOrderMock = jest.fn();
const createRefundMock = jest.fn();

jest.mock("@/config/razorpay", () => ({
  razorpayClient: {
    orders: {
      create: createOrderMock,
    },
    payments: {
      refund: createRefundMock,
    },
  },
}));

jest.mock("@/config/env", () => ({
  env: {
    RAZORPAY_KEY_SECRET: "checkout-key-secret",
    RAZORPAY_WEBHOOK_SECRET: "webhook-secret",
  },
}));

import { razorpayProvider } from "./razorpay.provider";

describe("RazorpayProvider", () => {
  it("verifies checkout signatures with the Razorpay key secret", () => {
    const orderId = "order_123";
    const paymentId = "pay_123";
    const signature = crypto
      .createHmac("sha256", "checkout-key-secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      razorpayProvider.verifyPayment({ orderId, paymentId, signature }),
    ).toBe(true);
  });

  it("does not accept a checkout signature made with the webhook secret", () => {
    const orderId = "order_123";
    const paymentId = "pay_123";
    const signature = crypto
      .createHmac("sha256", "webhook-secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      razorpayProvider.verifyPayment({ orderId, paymentId, signature }),
    ).toBe(false);
  });

  it("maps a Razorpay order into the application payment contract", async () => {
    createOrderMock.mockResolvedValueOnce({
      id: "order_456",
      amount: 150000,
      currency: "INR",
      status: "created",
    });

    await expect(
      razorpayProvider.createOrder({
        amount: 150000,
        currency: "INR",
        receipt: "appt_456",
        notes: { appointmentId: "456" },
      }),
    ).resolves.toEqual({
      id: "order_456",
      amount: 150000,
      currency: "INR",
      status: "created",
    });
  });

  it("creates a provider refund before the application records it", async () => {
    createRefundMock.mockResolvedValueOnce({
      id: "rfnd_123",
      amount: 150000,
      status: "processed",
    });

    await expect(
      razorpayProvider.createRefund({
        paymentId: "pay_123",
        amount: 150000,
        notes: { appointmentId: "appt_123" },
      }),
    ).resolves.toEqual({
      id: "rfnd_123",
      amount: 150000,
      status: "processed",
    });
  });
});
