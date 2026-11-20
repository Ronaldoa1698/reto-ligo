@regression @booking @authorization
Feature: Protección de reservas ante operaciones sin autorización

  Background:
    * url baseUrl
    * configure headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
    * configure afterScenario = read('classpath:support/cleanup-booking.js')
    * def bookingSchema = read('classpath:schemas/booking.schema.json')
    * def auth = call read('classpath:support/authenticate.feature')
    * def booking = read('classpath:data/booking.json')
    * set booking.firstname = 'QA-' + karate.uuid()

    Given path 'booking'
    And request booking
    When method post
    * def bookingId = response.bookingid
    Then status 200
    And match response == { bookingid: '#number', booking: '#(bookingSchema)' }
    And assert bookingId > 0
    And match response.booking == booking
    * configure cookies = null

  Scenario Outline: API-04: rechaza PUT con <authorization> y conserva la reserva original
    * copy attemptedBooking = booking
    * set attemptedBooking.lastname = 'UnauthorizedUpdate'
    * set attemptedBooking.totalprice = 999
    Given path 'booking', bookingId
    And headers <requestHeaders>
    And request attemptedBooking
    When method put
    Then status 403

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == bookingSchema
    And match response == booking

    Examples:
      | authorization  | requestHeaders                         |
      | sin token      | {}                                     |
      | token inválido | { Cookie: 'token=invalid-api-token' }   |

  Scenario Outline: API-05: rechaza DELETE con <authorization> y mantiene la reserva disponible
    Given path 'booking', bookingId
    And headers <requestHeaders>
    When method delete
    Then status 403

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == bookingSchema
    And match response == booking

    Examples:
      | authorization  | requestHeaders                         |
      | sin token      | {}                                     |
      | token inválido | { Cookie: 'token=invalid-api-token' }   |
