@regression @cart
Feature: Cantidad y eliminación de productos en el carrito

  Background:
    Given que el catálogo muestra el producto de referencia
    When abro el detalle del producto y lo agrego al carrito

  Scenario: MOB-02: aumentar y reducir la cantidad actualiza el importe
    Then el carrito conserva el producto con cantidad 1 y el importe correcto
    When aumento la cantidad del producto en el carrito
    Then el carrito conserva el producto con cantidad 2 y el importe correcto
    When reduzco la cantidad del producto en el carrito
    Then el carrito conserva el producto con cantidad 1 y el importe correcto

  Scenario: MOB-03: eliminar el producto deja el carrito vacío
    When elimino el producto del carrito
    Then el carrito queda vacío
