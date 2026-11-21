import { When, Then } from '@cucumber/cucumber';
import CartPage from '../pages/CartPage.js';
import { purchaseData } from '../data/purchase.data.js';

Then('el carrito conserva el producto con cantidad {int} y el importe correcto', async (quantity: number) => {
  await CartPage.expectProduct(purchaseData().product, quantity);
});

When('aumento la cantidad del producto en el carrito', async () => {
  await CartPage.increaseQuantity();
});

When('reduzco la cantidad del producto en el carrito', async () => {
  await CartPage.decreaseQuantity();
});

When('elimino el producto del carrito', async () => {
  await CartPage.removeProduct();
});

Then('el carrito queda vacío', async () => { await CartPage.expectEmpty(); });
