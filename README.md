# Payment Gateway UI (Next.js App Router)

Client checkout flow backed by an in-repo **`/api/pay` route** instead of an external PSP SDK. Card numbers are not transmitted in full—only a compact JSON payload (transaction id, amount, currency, last four digits, and cardholder name) is sent with the request.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Zustand with `persist` middleware for **`transactionHistory` in `localStorage`**

### Why Zustand

Redux Toolkit is excellent for huge apps with time-travel requirements. Here, a single feature slice (lifecycle + persisted history + selection) stays clearer with minimal boilerplate, and `persist` gives localStorage syncing without bespoke hydration code paths.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

```bash
npm run build   # production build + typecheck
npm run lint
```

## Behaviour

### Payment API route (`POST /api/pay`)

One random draw per request:

| Outcome       | Probability | Behaviour                                        |
|---------------|--------------|--------------------------------------------------|
| Success       | ~60%         | JSON `{ outcome: 'success', transactionId }`   |
| Failed        | ~25%         | JSON `{ outcome: 'failed', reason: '…' }`      |
| Slow / stalled| ~15%         | waits **8s** before responding                   |

Probabilities are **intended**, not statistically guaranteed.

### Client timeout

The browser sends `AbortController` cancellations after **6 seconds**, so slow responses reliably surface as a **timeout** UX even if the server eventually replies.

### Processing delay

Requests also wait on a **`Promise.all` with a fixed ~2 s delay** so the spinner is visible briefly even when the gateway answers immediately.

### Idempotency & retries

- A `crypto.randomUUID()` is generated **once per checkout session** and reused on every retry.
- **At most three total attempts**. The status panel shows `Attempt n of 3`.
- History **upserts** by transaction id so retries never duplicate rows.

### Expiry validation

Expiry **MM/YY** is compared against the **end of the current calendar month in the user’s local timezone** (see `utils/validate.ts`).

## Assumptions

- Amounts are **major currency units** (e.g. `49.99` USD / INR) stored as `number`.
- “Failed” and “timeout” share the same retry budget; both count toward the three-attempt cap.
- This is **not** PCI compliant—there is no tokenization, encryption, or network token API.

## What I would improve with more time

- Unit tests for validators, Luhn, and the hook’s state machine; Playwright for the full flow.
- Structured logging + correlation ids per attempt (without card data).
- Route Handler idempotency store (in-memory/Redis) that dedupes `transactionId` server-side.
- Stronger Mastercard/Discover detection, optional postal/ZIP validation, locale-aware amount parsing.
- E2E visual regression snapshots for mobile (375 px) and desktop (1280 px).

## Deployment

Compatible with Vercel or any Node host running `next start` after `next build`.

## License

Private—see repository owner for terms of use.
