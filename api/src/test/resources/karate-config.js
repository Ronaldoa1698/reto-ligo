function fn() {
  var baseUrl = karate.sysprop('api.baseUrl') || karate.sysenv('API_BASE_URL')
    || 'https://restful-booker.herokuapp.com';

  karate.configure('connectTimeout', 15000);
  karate.configure('readTimeout', 20000);
  karate.configure('headers', { Accept: 'application/json' });
  karate.configure('logging', {
    report: 'debug',
    console: 'warn',
    pretty: true,
    mask: {
      headers: ['Authorization', 'Cookie', 'Set-Cookie', 'Proxy-Authorization'],
      jsonPaths: ['$.username', '$.password', '$..token']
    }
  });

  return {
    baseUrl: baseUrl,
    readCredentials: function() {
      var username = karate.sysenv('API_USERNAME');
      var password = karate.sysenv('API_PASSWORD');
      if (!username || !password) {
        throw new Error('Configura API_USERNAME y API_PASSWORD en el entorno. Consulta api/README.md.');
      }
      return { username: username, password: password };
    }
  };
}
