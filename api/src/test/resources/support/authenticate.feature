@ignore @report=false
Feature: Autenticación reutilizable

  Scenario: Obtener un token de autenticación
    * def credentials = readCredentials()
    Given url baseUrl
    And path 'auth'
    And header Content-Type = 'application/json'
    And request credentials
    When method post
    Then status 200
    And match response == { token: '#string' }
    And assert response.token.length > 0
    * def token = response.token
