import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse } from "../types"
import { API_URL } from "../config"

/**
 * Create a Stripe checkout session for an appointment
 * @param appointmentData The appointment data to create a checkout session for
 * @returns A response containing the checkout URL
 */
export async function createStripeCheckoutSession(appointmentData: {
  appointmentId?: string
  title: string
  price: number
  tutorIds: string[]
  studentIds: string[]
  startTime: string
  endTime: string
  notes?: string
}): Promise<ApiResponse<{ url: string }>> {
  try {
    // Use the server-side API route instead of direct Stripe API call
    const response = await fetch(`/api/stripe/checkout`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify({ appointmentData }),
      credentials: "include",
    })

    return await handleResponse<{ url: string }>(response)
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating checkout session",
    }
  }
}

/**
 * Verify a Stripe payment status
 * @param sessionId The Stripe session ID to verify
 * @returns A response containing the payment status
 */
export async function verifyStripePayment(
  sessionId: string,
): Promise<ApiResponse<{ status: string; appointmentId?: string }>> {
  try {
    // Use the server-side API route instead of direct Stripe API call
    const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`, {
      method: "GET",
      headers: createAuthHeaders(),
      credentials: "include",
    })

    return await handleResponse<{ status: string; appointmentId?: string }>(response)
  } catch (error) {
    console.error("Error verifying payment:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while verifying payment",
    }
  }
}

/**
 * Get customer payment methods
 * @returns A response containing the customer's saved payment methods
 */
export async function getCustomerPaymentMethods(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/stripe/payment-methods`, {
      method: "GET",
      headers: createAuthHeaders(),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching payment methods",
    }
  }
}

/**
 * Create a Stripe customer
 * @param customerData The customer data to create
 * @returns A response containing the created customer
 */
export async function createStripeCustomer(customerData: {
  email: string
  name: string
  metadata?: Record<string, string>
}): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/stripe/customer`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(customerData),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    console.error("Error creating customer:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating customer",
    }
  }
}

/**
 * Create a Stripe payment intent
 * @param paymentData The payment data to create a payment intent
 * @returns A response containing the client secret
 */
export async function createStripePaymentIntent(paymentData: {
  amount: number
  currency?: string
  metadata?: Record<string, string>
  appointmentId?: string
}): Promise<ApiResponse<{ clientSecret: string }>> {
  try {
    const response = await fetch(`/api/stripe/payment-intent`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(paymentData),
      credentials: "include",
    })

    return await handleResponse<{ clientSecret: string }>(response)
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating payment intent",
    }
  }
}

/**
 * Update an appointment with payment information
 * @param appointmentId The ID of the appointment to update
 * @param paymentData The payment data to update
 * @returns A response containing the updated appointment
 */
export async function updateAppointmentPayment(
  appointmentId: string,
  paymentData: {
    paymentId: string
    paymentStatus: string
    paymentAmount: number
  },
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}/payment`, {
      method: "PUT",
      headers: createAuthHeaders(),
      body: JSON.stringify(paymentData),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    console.error("Error updating appointment payment:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while updating appointment payment",
    }
  }
}
