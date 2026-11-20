# language: en
@regression @login
  Feature: Login de SauceDemo

  Background:
    Given que estoy en la página de acceso de SauceDemo

  @smoke
  Scenario: WEB-LOGIN-01: muestra el formulario de acceso
    Then veo el formulario de acceso disponible

  @smoke
  Scenario: WEB-LOGIN-02: permite acceder al catálogo con un usuario válido
    When inicio sesión con un usuario válido
    Then veo el catálogo de productos

  Scenario: WEB-LOGIN-03: rechaza credenciales inválidas
    When intento iniciar sesión con credenciales inválidas
    Then se informa que las credenciales son incorrectas
    And permanezco en la página de acceso

  Scenario: WEB-LOGIN-04: rechaza el acceso de un usuario bloqueado
    When intento iniciar sesión con un usuario bloqueado
    Then se informa que el usuario está bloqueado
    And permanezco en la página de acceso
