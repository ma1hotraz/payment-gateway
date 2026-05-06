"use client";

import type { Transaction } from "@/types";
import { usePaymentStore } from "@/store/usePaymentStore";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusLabel(status: Transaction["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "success":
      return "Success";
    case "failed":
      return "Failed";
    case "timeout":
      return "Timeout";
  }
}

export function TransactionHistory() {
  const hasRehydrated = usePaymentStore((s) => s.hasRehydrated);
  const items = usePaymentStore((s) => s.transactionHistory);
  const selectedId = usePaymentStore((s) => s.selectedTransactionId);
  const setSelectedId = usePaymentStore((s) => s.setSelectedTransactionId);

  const selected = items.find((t) => t.id === selectedId) ?? null;

  if (!hasRehydrated) {
    return (
      <section aria-label="Transaction history loading" className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading saved history…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section
        aria-labelledby="history-heading"
        className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950"
      >
        <h2 id="history-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Transaction history
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No payments yet. Successful and attempted payments appear here.</p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="history-heading"
      className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="history-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Transaction history
        </h2>
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {items.length} total
        </span>
      </div>

      <ul className="max-h-[min(24rem,50vh)] space-y-2 overflow-auto pr-1" role="list">
        {items.map((txn) => {
          const sel = txn.id === selectedId;
          return (
            <li key={txn.id}>
              <button
                type="button"
                onClick={() => setSelectedId(txn.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm shadow-sm motion-safe:transition ${
                  sel
                    ? "border-zinc-900 bg-zinc-50 ring-2 ring-offset-2 ring-zinc-900 dark:border-zinc-100 dark:bg-zinc-900 dark:ring-zinc-100"
                    : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500"
                }`}
                aria-current={sel ? "true" : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{txn.id}</span>
                  <span className="text-xs font-semibold">{statusLabel(txn.status)}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <span>
                    <span className="sr-only">Amount:</span>
                    <span aria-hidden>{txn.currency}</span> {txn.amount.toFixed(2)}
                  </span>
                  <time dateTime={txn.updatedAt}>{formatWhen(txn.updatedAt)}</time>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100">
        {selected ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Selected transaction
            </p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">ID</dt>
                <dd className="break-all font-mono text-[11px]">{selected.id}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd className="font-medium">{statusLabel(selected.status)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Amount</dt>
                <dd>
                  {selected.currency} {selected.amount.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Attempts recorded</dt>
                <dd>{selected.attemptCount}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
                <dd>
                  <time dateTime={selected.createdAt}>{formatWhen(selected.createdAt)}</time>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Last updated</dt>
                <dd>
                  <time dateTime={selected.updatedAt}>{formatWhen(selected.updatedAt)}</time>
                </dd>
              </div>
              {selected.lastUserMessage ? (
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Message</dt>
                  <dd>{selected.lastUserMessage}</dd>
                </div>
              ) : null}
              {selected.lastFailureReason ? (
                <div className="sm:col-span-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Reason (simulated)</dt>
                  <dd>{selected.lastFailureReason}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-300">
            Select a transaction to view full details.
          </p>
        )}
      </div>
    </section>
  );
}
