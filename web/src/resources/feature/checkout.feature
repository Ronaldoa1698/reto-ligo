# language: en
@regression @checkout
Feature: Validación de los datos del comprador

  Background:
    Given que inicié sesión con un usuario válido
    And que tengo el producto de prueba en el formulario de checkout

  Scenario Outline: WEB-CHECKOUT-01: rechaza el checkout sin <campo>
    When completo el checkout dejando vacío "<campo>"
    Then se muestra el error de checkout "<error>"
    And permanezco en el formulario de datos del comprador

    Examples:
      | campo      | error                          |
      | firstName  | Error: First Name is required  |
      | lastName   | Error: Last Name is required   |
      | postalCode | Error: Postal Code is required |
