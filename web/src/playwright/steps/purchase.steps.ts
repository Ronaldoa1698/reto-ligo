import { When, Then } from '../fixtures/test.js';

When('agrego el producto de prueba al carrito', async ({ inventoryPage, purchaseData }) => {
  await inventoryPage.addProductToCart(purchaseData.product.name);
});

When('abro el carrito', async ({ inventoryPage }) => {
  await inventoryPage.openCart();
});

Then('el carrito contiene únicamente el producto seleccionado', async ({ cartPage, purchaseData }) => {
  await cartPage.expectOnlyProduct(purchaseData.product);
});

When('inicio el checkout', async ({ cartPage }) => {
  await cartPage.startCheckout();
});

When('completo los datos del comprador', async ({ checkoutInformationPage, purchaseData }) => {
  await checkoutInformationPage.completeInformation(purchaseData.customer);
});

Then('el resumen muestra el producto y los importes esperados', async ({ checkoutOverviewPage, purchaseData }) => {
  await checkoutOverviewPage.expectOrderSummary(purchaseData.product, purchaseData.expectedTaxInCents);
});

When('confirmo la compra', async ({ checkoutOverviewPage }) => {
  await checkoutOverviewPage.finishPurchase();
});

Then('se muestra la confirmación de compra', async ({ checkoutCompletePage, $testInfo }) => {
  await checkoutCompletePage.expectOrderConfirmed();
  await $testInfo.attach('purchase-confirmation', {
    body: await checkoutCompletePage.captureScreenshot(),
    contentType: 'image/png',
  });
});

Then('el carrito queda vacío después de la compra', async ({ checkoutCompletePage, cartPage }) => {
  await checkoutCompletePage.openCart();
  await cartPage.expectEmpty();
});
