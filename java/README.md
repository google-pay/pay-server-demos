# Google Pay Server Demos — Java

This directory demonstrates integrating Google Pay with Payments Service Providers (PSPs), server-side, in Java.

It covers 4 PSPs: **Adyen, Checkout.com, Square, and Stripe**. More PSPs will be added as official client SDKs or REST
integrations are introduced.

## Build & test

Requires Java 17+ and Maven.

```sh
mvn compile
mvn test
```

## Client Library

Each PSP has a `PspClient` in [`PspClients`](src/main/java/com/googlepay/pspclient/PspClients.java) with a single
`pay(config, order)` method, which validates and normalizes the order, then charges it via that PSP.

**Example:**

```java
import com.googlepay.pspclient.Order;
import com.googlepay.pspclient.PspClients;
import java.util.Map;

// PSP-specific configuration, in this case Stripe.
Map<String, Object> config = Map.of("secretKey", "sk_test_...");

// An order requires a total, currency, and the client-side response from the Google Pay API.
Order order = new Order();
order.total = 100.0;
order.currency = "USD";
order.paymentResponse = paymentResponseFromClient; // an Order.PaymentResponse

try {
  Object response = PspClients.STRIPE.pay(config, order); // PSP-specific response, e.g. a Charge.
} catch (Exception e) {
  // PSP-specific error.
}
```

`order.totalInt` (the total in the currency's smallest unit, e.g. cents for USD) and `order.totalFixed` (the
fixed-precision decimal string) are computed for you before the PSP handler runs.

## Current PSPs

- [Adyen](https://docs.adyen.com/payment-methods/google-pay/api-only) —
  [`adyen-java-api-library`](https://github.com/Adyen/adyen-java-api-library)
- [Checkout.com](https://docs.checkout.com/payments/payment-methods/wallets/google-pay) —
  [`checkout-sdk-java`](https://github.com/checkout/checkout-sdk-java)
- [Square](https://developer.squareup.com/docs/payment-form/add-digital-wallets/google-pay) —
  [`square`](https://github.com/square/square-java-sdk)
- [Stripe](https://stripe.com/docs/google-pay) — [`stripe-java`](https://github.com/stripe/stripe-java)

## Adding a new PSP

1. Add a new `XyzHandler implements PaymentHandler` to `src/main/java/com/googlepay/pspclient/handlers`. Its `pay`
   method receives a `Map<String, Object> config` and a normalized `Order` (with `totalInt`/`totalFixed`/`id`/
   `description` already computed, and `paymentToken` already extracted from `paymentResponse` and JSON-parsed where
   possible), and should return the PSP's response or throw on failure.
2. Register it as a constant in [`PspClients`](src/main/java/com/googlepay/pspclient/PspClients.java):
   `new PspClient(new XyzHandler())`.

If the PSP has no Java SDK, implement the handler against its REST API directly with `java.net.http.HttpClient`.
