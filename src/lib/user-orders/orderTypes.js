/**
 * JSDoc-only types for user orders (no TypeScript).
 * Normalized order shape used across user orders pages.
 */

/**
 * @typedef {Object} NormalizedOrderItem
 * @property {string} id
 * @property {string} productName
 * @property {number} quantity
 * @property {number} price
 * @property {number} total
 */

/**
 * @typedef {Object} NormalizedOrder
 * @property {string} id
 * @property {string} orderNumber
 * @property {string} status
 * @property {number} total
 * @property {number} subtotal
 * @property {Date} orderDate
 * @property {string} businessId
 * @property {string} businessName
 * @property {string} businessSlug
 * @property {string} businessLogo
 * @property {NormalizedOrderItem[]} items
 * @property {string} deliveryAddress
 * @property {string} deliveryNote
 * @property {string|null} deliveryType
 * @property {string} paymentMethod
 */
