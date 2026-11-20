export type PurchaseProduct = {
  name: string;
  unitPriceInCents: number;
  quantity: number;
};

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export type PurchaseData = {
  product: PurchaseProduct;
  customer: CheckoutCustomer;
  expectedTaxInCents: number;
};
