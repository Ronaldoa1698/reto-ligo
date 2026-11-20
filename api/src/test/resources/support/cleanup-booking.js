function fn() {
  var bookingId = karate.get('bookingId');
  var bookingDeleted = karate.get('bookingDeleted', false);
  var auth = karate.get('auth');
  if (bookingId && !bookingDeleted && auth && auth.token) {
    karate.call('classpath:support/delete-booking.feature', {
      bookingId: bookingId,
      token: auth.token
    });
  }
}
