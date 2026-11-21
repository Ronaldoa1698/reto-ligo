@regression @booking
Feature: Ciclo de vida de una reserva

  Background:
    * url baseUrl
    * configure headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
    * def bookingSchema = read('classpath:schemas/booking.schema.json')
    * configure afterScenario = read('classpath:support/cleanup-booking.js')

  @smoke
  Scenario: API-01: crea, consulta, actualiza y elimina una reserva con persistencia
    * def auth = call read('classpath:support/authenticate.feature')
    * def booking = read('classpath:data/booking.json')
    * set booking.firstname = 'QA-' + karate.uuid()

    Given path 'booking'
    And request booking
    When method post
    * def bookingId = response.bookingid
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == { bookingid: '#number', booking: '#(bookingSchema)' }
    And assert bookingId > 0
    And match response.booking == booking

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == bookingSchema
    And match response == booking

    * copy updatedBooking = booking
    * set updatedBooking.lastname = 'Updated'
    * set updatedBooking.totalprice = 225
    * set updatedBooking.depositpaid = false
    Given path 'booking', bookingId
    And cookie token = auth.token
    And request updatedBooking
    When method put
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == bookingSchema
    And match response == updatedBooking

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == updatedBooking

    Given path 'booking', bookingId
    And cookie token = auth.token
    When method delete
    Then status 201

    Given path 'booking', bookingId
    When method get
    Then status 404
    * def bookingDeleted = true

  @patch
  Scenario: API-02: actualiza parcialmente una reserva y conserva los campos no enviados
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

    * def partialUpdate = { lastname: 'PartiallyUpdated' }
    * copy expectedBooking = booking
    * set expectedBooking.lastname = partialUpdate.lastname
    Given path 'booking', bookingId
    And cookie token = auth.token
    And request partialUpdate
    When method patch
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == bookingSchema
    And match response == expectedBooking

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == bookingSchema
    And match response == expectedBooking
