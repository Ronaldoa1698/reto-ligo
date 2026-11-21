export const purchaseData = () => ({
  product: { name: 'Sauce Labs Backpack', priceCents: 2999 },
  deliveryCents: 599,
  shipping: { fullName: 'QA Automation', address: 'Calle Pruebas 123', city: 'Lima', zip: '15001', country: 'Peru' },
  // Datos ficticios para la simulación de pago de la demo.
  payment: { fullName: 'QA Automation', number: '0000000000000000', expiration: '12/30', code: '123' },
});
export type PurchaseData = ReturnType<typeof purchaseData>;
