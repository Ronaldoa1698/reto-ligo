import { When, Then } from '@cucumber/cucumber';
import CartPage from '../pages/CartPage.js';
import LoginPage from '../pages/LoginPage.js';
import ShippingPage from '../pages/ShippingPage.js';
import PaymentPage from '../pages/PaymentPage.js';
import ReviewPage from '../pages/ReviewPage.js';
import { purchaseData } from '../data/purchase.data.js';

When('inicio checkout con la cuenta de demostración disponible', async () => {
  await CartPage.proceedToCheckout();
  await LoginPage.loginWithDemoAccount();
});

When('completo la dirección de envío', async () => {
  await ShippingPage.fillAddress(purchaseData().shipping);
  await ShippingPage.continueToPayment();
});

When('completo la dirección de envío dejando el nombre vacío', async () => {
  await ShippingPage.fillAddress({ ...purchaseData().shipping, fullName: '' });
  await ShippingPage.continueToPayment();
});

Then('checkout muestra el error de nombre obligatorio', async () => {
  await ShippingPage.expectMissingNameError();
});

When('completo los datos ficticios de pago', async () => {
  await PaymentPage.fillPayment(purchaseData().payment);
  await PaymentPage.continueToReview();
});

Then('el resumen conserva el producto y calcula el total con envío', async () => {
  await ReviewPage.expectOrder(purchaseData());
});
