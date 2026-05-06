"use client";

import { useMemo, useState } from "react";
import type { PaymentFormValues, TouchedFields } from "@/types";
import {
  buildFieldErrors,
  isFormFullyValid,
} from "@/utils/validate";

export function usePaymentFormModel() {
  const [values, setValues] = useState<PaymentFormValues>(() => ({
    cardholderName: "",
    cardNumberDigits: "",
    expiryMmYy: "",
    cvv: "",
    amount: "",
    currency: "USD",
  }));
  const [touched, setTouched] = useState<TouchedFields>({});

  const errors = useMemo(() => buildFieldErrors(values), [values]);

  /** Assignment: errors while typing **or** after blur — `PaymentForm` sets touched onChange + onBlur. */
  const visibleError = <K extends keyof PaymentFormValues>(field: K) =>
    Boolean(touched[field]) && Boolean(errors[field]);

  const reset = () => {
    setValues({
      cardholderName: "",
      cardNumberDigits: "",
      expiryMmYy: "",
      cvv: "",
      amount: "",
      currency: "USD",
    });
    setTouched({});
  };

  const valid = isFormFullyValid(values);

  return {
    values,
    setValues,
    touched,
    setTouched,
    errors,
    visibleError,
    valid,
    reset,
  };
}
