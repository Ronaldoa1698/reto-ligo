@regression @auth @credencialesInvalidas
Feature: Rechazo de autenticación inválida

  Scenario: API-03: credenciales inválidas no generan un token
    Given url baseUrl
    And path 'auth'
    And header Content-Type = 'application/json'
    And request { username: 'invalid-api-user', password: 'invalid-api-password' }
    When method post
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == { reason: 'Bad credentials' }
