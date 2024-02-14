import { NextRequest, NextResponse } from "next/server";
import {
  LineItems,
  Orders,
  Payments,
  SubscriptionInterval,
  SubscriptionItems,
  Subscriptions,
} from "ordercloud-javascript-sdk";

import moment from "moment";
import { orderCloudLogin } from "@lib/orderCloud/serverside";
import { PaymentMethod } from "@stripe/stripe-js";
import { StripPaymentResponse } from "types/SubscriptionRequest";

// Read this for base information on the integration calls from OrderCloud to the middleware:
// https://ordercloud.io/knowledge-base/subscriptions
// This is being called if it's a success.

export async function GET(request: NextRequest, { params }) {
  try {
    const stripePaymentRequest: StripPaymentResponse = {
      payment_intent: request.nextUrl.searchParams.get("payment_intent"),
      payment_intent_client_secret: request.nextUrl.searchParams.get(
        "payment_intent_client_secret"
      ),
      redirect_status: request.nextUrl.searchParams.get("redirect_status"),
      orderId: params.slug,
      url: request.url,
    };

    // TODO: Validate incoming request for security and data integrity.
    console.log("Strip Payment Response received");

    if (!stripePaymentRequest || !stripePaymentRequest.payment_intent) {
      return NextResponse.redirect(
        new URL(`/not-found`, process.env.NEXT_PUBLIC_URL)
      );
    }

    const result = await createOrder(stripePaymentRequest);

    if (result) {
      return NextResponse.redirect(
        new URL(`/payment/${params.slug}`, process.env.NEXT_PUBLIC_URL)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/not-found`, process.env.NEXT_PUBLIC_URL)
      );
    }
  } catch (error) {
    let message;
    if (error instanceof Error) message = error.message;
    else message = String(error);
    console.error("Error processing request:", error);
    return NextResponse.json(
      { HttpStatusCode: 500, UnhandledErrorBody: message },
      { status: 500 }
    );
  }
}

// Create the subscription order.
// Subscription orders are created by OrderCloud, but you have to handle various actions and finalize the order (SUBMITTED).
async function createOrder(request: StripPaymentResponse) {
  return new Promise(async (resolve, reject) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const accessToken = await orderCloudLogin();

    const order = await Orders.Get("All", request.orderId, {
      accessToken: accessToken,
    });

    if (!order || order.Status !== "Unsubmitted") {
      resolve(false);
      return;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      request.payment_intent
    );

    const paymentMethod: PaymentMethod = await stripe.paymentMethods.retrieve(
      paymentIntent.payment_method
    );

    const orderPayments = await Payments.List("All", order.ID, undefined, {
      accessToken: accessToken,
    });

    if (orderPayments.Items.length > 0) {
      for (const orderPayment of orderPayments.Items) {
        await Payments.Delete("All", order.ID, orderPayment.ID, {
          accessToken: accessToken,
        });
      }
    }

    const payment = await Payments.Create(
      "All",
      order.ID,
      {
        Type: "CreditCard",
        Accepted: true,
        Amount: order.Total,
        DateCreated: moment().toISOString(),
        Transactions: [
          {
            Amount: paymentIntent.amount / 100,
            Currency: paymentIntent.currency,
            DateExecuted: moment().toISOString(),
            Succeeded: true,
            ResultCode: paymentIntent.status,
            Type:
              (paymentIntent.payment_method_types?.length ?? 0) > 0
                ? paymentIntent.payment_method_types[0]
                : "card",
          },
        ],
      },
      { accessToken: accessToken }
    );

    const lineItems = await LineItems.List("All", order.ID, undefined, {
      accessToken: accessToken,
    });

    const subscriptionLineItems = lineItems.Items.filter((l) => {
      return (l?.xp?.Subscription ?? false) === true;
    });
    const isSubscription = subscriptionLineItems.length > 0;

    if (isSubscription) {
      const interval: SubscriptionInterval =
        order.xp?.Subscription?.Interval ?? "Weeks";
      const frequency: number =
        parseInt(order.xp?.Subscription?.Frequency) ?? 4;

      let nextOrderDate = moment();

      switch (interval) {
        case "Days":
          nextOrderDate = nextOrderDate.add(frequency, "days");
          break;
        case "Weeks":
          nextOrderDate = nextOrderDate.add(frequency, "weeks");
          break;
        case "Months":
          nextOrderDate = nextOrderDate.add(frequency, "months");
          break;
      }
      const subscription = await Subscriptions.Create(
        {
          ID: `S${order.ID}`,
          FromCompanyID: order.FromCompanyID,
          ToCompanyID: order.ToCompanyID,
          BillingAddressID: order.BillingAddressID,
          ShippingAddressID: order.ShippingAddressID,
          Frequency: frequency,
          Interval: interval,
          NextOrderDate: moment.utc(nextOrderDate).toISOString(),
          xp: {
            Token: paymentIntent.client_secret,
            Id: paymentMethod.id,
            CustomerId: paymentMethod.customer,
          },
        },
        { accessToken: accessToken }
      );

      for (const line of subscriptionLineItems) {
        const lineItem = await SubscriptionItems.Create(subscription.ID, line, {
          accessToken: accessToken,
        });
      }

      await Orders.Patch(
        "All",
        order.ID,
        {
          SubscriptionID: subscription.ID,
          xp: {
            Subscription: {
              Frequency: subscription.Frequency,
              Interval: subscription.Interval,
              Id: subscription.ID,
              Active: subscription.Active,
            },
          },
        },
        { accessToken: accessToken }
      );
    }

    const finalOrder = await Orders.Submit("All", order.ID, {
      accessToken: accessToken,
    });

    resolve(true);
    return;
  });
}
