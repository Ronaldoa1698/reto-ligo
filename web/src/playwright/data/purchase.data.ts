import type { PurchaseData } from '../types/purchase.types.js';

export function createPurchaseData(): PurchaseData {
  return {
    product: {
      name: 'Sauce Labs Backpack',
      unitPriceInCents: 2999,
      quantity: 1,
    },
    customer: {
      firstName: 'QA',
      lastName: 'Automation',
      postalCode: '15001',
    },
    expectedTaxInCents: 240,
  };
}
