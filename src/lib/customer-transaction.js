export const CUSTOMER_PAYMENT_METHODS = ["CASH", "CREDIT_CARD", "BANK"];

export const CUSTOMER_CHECK_OPS = {
  RECEIVED: "CUSTOMER_CHECK_RECEIVED",
};

export const CUSTOMER_NOTE_OPS = {
  RECEIVED: "CUSTOMER_NOTE_RECEIVED",
  GIVEN: "CUSTOMER_NOTE_GIVEN",
};

export const CUSTOMER_ACTION_OPS = {
  BALANCE_ADJUST: "BALANCE_ADJUST",
};

export function customerCategory(customerId, kind, operation) {
  return `CUSTOMER:${customerId}:${kind}:${operation}`;
}

export function parseCustomerCategory(category) {
  const raw = String(category || "");
  const parts = raw.split(":");
  if (parts.length < 4 || parts[0] !== "CUSTOMER") return null;
  return {
    customerId: parts[1],
    kind: parts[2],
    operation: parts.slice(3).join(":"),
  };
}
