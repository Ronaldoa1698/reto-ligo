# language: en
@regression @cart
Feature: Gestión del carrito de SauceDemo

  Background:
    Given que inicié sesión con un usuario válido

  Scenario: WEB-CART-01: elimina un producto y conserva el carrito vacío
    When agrego el producto de prueba al carrito
    And abro el carrito
    Then el carrito contiene únicamente el producto seleccionado
    When elimino el producto seleccionado del carrito
    Then el carrito está vacío
    And el carrito permanece vacío al recargar la página
