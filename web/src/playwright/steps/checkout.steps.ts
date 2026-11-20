import { Given, When, Then } from '../fixtures/test.js';

Given('que tengo el producto de prueba en el formulario de checkout', async ({
  inventoryPage,
  cartPage,
  purchaseData,
}) => {
  await inventoryPage.addProductToCart(purchaseData.product.name);
  await inventoryPage.openCart();
  await cartPage.startCheckout();
});

When('completo el checkout dejando vacío {string}', async ({ checkoutInformationPage, purchaseData }, field: string) => {
  if (!Object.hasOwn(purchaseData.customer, field)) {
    throw new Error(`Campo de comprador desconocido en el escenario: ${field}`);
  }
  await checkoutInformationPage.completeInformation({
    ...purchaseData.customer,
    [field]: '',
  });
});

Then('se muestra el error de checkout {string}', async ({ checkoutInformationPage }, message: string) => {
  await checkoutInformationPage.expectValidationError(message);
});

Then('permanezco en el formulario de datos del comprador', async ({ checkoutInformationPage }) => {
  await checkoutInformationPage.expectInformationFormVisible();
});
