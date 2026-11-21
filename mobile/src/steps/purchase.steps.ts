import { When, Then } from '@cucumber/cucumber';
import ReviewPage from '../pages/ReviewPage.js';
import CompletePage from '../pages/CompletePage.js';
import CatalogPage from '../pages/CatalogPage.js';
import { purchaseData } from '../data/purchase.data.js';

When('confirmo el pedido', async () => { await ReviewPage.placeOrder(); });

Then('la aplicación confirma la compra', async () => {
  await CompletePage.expectConfirmed();
  await CompletePage.captureConfirmation();
});

When('regreso al catálogo y abro el carrito', async () => {
  await CompletePage.continueShopping();
  await CatalogPage.expectProductAvailable(purchaseData().product.name);
  await CatalogPage.openCart();
});
