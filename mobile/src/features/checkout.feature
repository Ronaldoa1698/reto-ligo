@regression @checkout
Feature: Datos obligatorios de envío

  Background:
    Given que el catálogo muestra el producto de referencia
    When abro el detalle del producto y lo agrego al carrito
    And inicio checkout con la cuenta de demostración disponible

  Scenario: MOB-04: el nombre vacío impide avanzar al pago
    When completo la dirección de envío dejando el nombre vacío
    Then checkout muestra el error de nombre obligatorio
