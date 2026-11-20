import { Given, When, Then } from '../fixtures/test.js';

Given('que estoy en la página de acceso de SauceDemo', async ({ loginPage }) => {
  await loginPage.navigateToUrl('/');
});

Given('que inicié sesión con un usuario válido', async ({ loginPage, credentials }) => {
  await loginPage.navigateToUrl('/');
  await loginPage.login(credentials.username, credentials.password);
});

Then('veo el formulario de acceso disponible', async ({ loginPage }) => {
  await loginPage.expectFormVisible();
});

When('inicio sesión con un usuario válido', async ({ loginPage, credentials }) => {
  await loginPage.login(credentials.username, credentials.password);
});

Then('veo el catálogo de productos', async ({ inventoryPage }) => {
  await inventoryPage.expectCatalogVisible();
});

When('intento iniciar sesión con credenciales inválidas', async ({ loginPage }) => {
  await loginPage.login('invalid-user', 'invalid-password');
});

When('intento iniciar sesión con un usuario bloqueado', async ({ loginPage, credentials }) => {
  await loginPage.loginWithLockedUser(credentials.password);
});

Then('se informa que el usuario está bloqueado', async ({ loginPage }) => {
  await loginPage.expectLockedUserError();
});

Then('se informa que las credenciales son incorrectas', async ({ loginPage }) => {
  await loginPage.expectInvalidCredentialsError();
});

Then('permanezco en la página de acceso', async ({ loginPage }) => {
  await loginPage.expectLoginPageVisible();
});
