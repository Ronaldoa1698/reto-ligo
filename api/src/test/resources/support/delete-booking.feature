@ignore
Feature: Limpieza de la reserva creada por el escenario

  Scenario: Eliminar la reserva si todavía existe
    * configure afterScenario = null
    Given url baseUrl
    And path 'booking', bookingId
    And cookie token = token
    When method delete
    Then assert responseStatus == 201 || responseStatus == 405

    Given path 'booking', bookingId
    When method get
    Then status 404
