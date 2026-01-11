export interface BillingInputs {
  organizationId: string;
  credits: number;
  street?: string;
  city?: string;
  zip?: string;
  country: string;
  company: string;
  civility: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export enum StripeWebhookEvents {
  CHECKOUT_SESSION_COMPLETED = "checkout.session.completed",
  CHECKOUT_SESSION_EXPIRED = "checkout.session.expired",

  CUSTOMER_CREATED = "customer.created",
  CUSTOMER_UPDATED = "customer.updated",
  CUSTOMER_DELETED = "customer.deleted",

  CUSTOMER_SUBSCRIPTION_CREATED = "customer.subscription.created",
  CUSTOMER_SUBSCRIPTION_UPDATED = "customer.subscription.updated",
  CUSTOMER_SUBSCRIPTION_DELETED = "customer.subscription.deleted",

  INVOICE_PAID = "invoice.paid",
  INVOICE_PAYMENT_FAILED = "invoice.payment_failed",
  INVOICE_PAYMENT_SUCCEEDED = "invoice.payment_succeeded",
}
