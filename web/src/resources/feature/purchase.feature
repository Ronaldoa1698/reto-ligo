# language: en
@regression @purchase
Feature: Compra de productos en SauceDemo

  Background:
    Given que inicié sesión con un usuario válido

  @smoke @purchase
  Scenario: WEB-PURCHASE-01: completa la compra de un producto
    When agrego el producto de prueba al carrito
    And abro el carrito
    Then el carrito contiene únicamente el producto seleccionado
    When inicio el checkout
    And completo los datos del comprador
    Then el resumen muestra el producto y los importes esperados
    When confirmo la compra
    Then se muestra la confirmación de compra
    And el carrito queda vacío después de la compra
