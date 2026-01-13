import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  try {
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const startingAfter = searchParams.get("starting_after") || undefined;

    // Récupérer le customer Stripe associé à l'utilisateur
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        invoices: [],
        hasMore: false,
      });
    }

    const customer = customers.data[0];

    // Récupérer les factures du customer
    const invoices = await stripe.invoices.list({
      customer: customer?.id,
      limit,
      starting_after: startingAfter,
      expand: ["data.subscription", "data.payment_intent"],
    });

    if (!invoices.data || invoices.data.length === 0) {
      return NextResponse.json({
        invoices: [],
        hasMore: false,
        lastId: null,
      });
    }

    // Formatter les données pour le front-end
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created,
      dueDate: invoice.due_date,
      paidAt: invoice.status_transitions.paid_at,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      description: invoice.description,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      hasMore: invoices.has_more || false,
      lastId: invoices.data[invoices.data.length - 1]?.id || null,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
