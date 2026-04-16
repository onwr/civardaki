export const SUPPLIER_PAYMENT_METHODS = ["CASH", "CREDIT_CARD", "BANK"];

export const SUPPLIER_CHECK_OPS = {
  GIVEN: "SUPPLIER_CHECK_GIVEN",
  RECEIVED: "SUPPLIER_CHECK_RECEIVED",
};

export const SUPPLIER_NOTE_OPS = {
  GIVEN: "SUPPLIER_NOTE_GIVEN",
  RECEIVED: "SUPPLIER_NOTE_RECEIVED",
};

export const SUPPLIER_ACTION_OPS = {
  COLLECTION_REQUEST: "COLLECTION_REQUEST",
  BALANCE_ADJUST: "BALANCE_ADJUST",
  DEBIT_CREDIT_SLIP: "DEBIT_CREDIT_SLIP",
  CURRENT_TRANSFER: "CURRENT_TRANSFER",
};

export function supplierCategory(supplierId, kind, operation) {
  return `SUPPLIER:${supplierId}:${kind}:${operation}`;
}

export function parseSupplierCategory(category) {
  const raw = String(category || "");
  const parts = raw.split(":");
  if (parts.length < 4 || parts[0] !== "SUPPLIER") {
    return null;
  }
  return {
    supplierId: parts[1],
    kind: parts[2],
    operation: parts.slice(3).join(":"),
  };
}

