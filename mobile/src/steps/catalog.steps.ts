import { Given, When } from '@cucumber/cucumber';
import CatalogPage from '../pages/CatalogPage.js';
import ProductPage from '../pages/ProductPage.js';
import { purchaseData } from '../data/purchase.data.js';

Given('que el catálogo muestra el producto de referencia', async () => {
  await CatalogPage.expectProductAvailable(purchaseData().product.name);
});

When('abro el detalle del producto y lo agrego al carrito', async () => {
  await CatalogPage.openProduct(purchaseData().product.name);
  await ProductPage.expectProduct(purchaseData().product);
  await ProductPage.addToCart();
  await ProductPage.openCart();
});
