@regression @purchase
Feature: Compra desde la aplicación Android

  Background:
    Given que el catálogo muestra el producto de referencia

  @smoke
  Scenario: MOB-01: compra completa conserva producto e importes y termina con carrito vacío
    When abro el detalle del producto y lo agrego al carrito
    Then el carrito conserva el producto con cantidad 1 y el importe correcto
    When inicio checkout con la cuenta de demostración disponible
    And completo la dirección de envío
    And completo los datos ficticios de pago
    Then el resumen conserva el producto y calcula el total con envío
    When confirmo el pedido
    Then la aplicación confirma la compra
    When regreso al catálogo y abro el carrito
    Then el carrito queda vacío
