import { When, Then } from '../fixtures/test.js';

When('elimino el producto seleccionado del carrito', async ({ cartPage, purchaseData }) => {
  await cartPage.removeProduct(purchaseData.product.name);
});

Then('el carrito está vacío', async ({ cartPage }) => {
  await cartPage.expectEmpty();
});

Then('el carrito permanece vacío al recargar la página', async ({ cartPage }) => {
  await cartPage.reload();
  await cartPage.expectEmpty();
});
