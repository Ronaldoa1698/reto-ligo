# API · Karate v2

Framework para Restful Booker con Karate 2.1.4, Java 21 y Maven. Los escenarios usan el DSL nativo de Karate; no requieren clases de steps ni Page Objects.

## Preparación local

Desde la raíz del repositorio:

```bash
cd api
java -version
mvn -version
cp .env.example .env
```

Completa `API_USERNAME` y `API_PASSWORD` en `.env` con las credenciales del servicio de prueba, disponibles en la [documentación pública de Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html#api-Auth-CreateToken). El archivo está excluido de Git. No vuelvas a copiar el ejemplo si ya configuraste `.env`.

En macOS, si Maven apunta al JDK anterior, selecciona Java 21 en la terminal:

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
export PATH="$JAVA_HOME/bin:$PATH"
```

Carga las variables antes de ejecutar. Maven y Karate no leen `.env` automáticamente:

```bash
set -a
source ./.env
set +a
mvn test
```

La primera ejecución descarga las dependencias. Las siguientes reutilizan la caché de Maven.

## Ejecución y tags

```bash
# Toda la regresión
mvn test

# Smoke: ciclo completo y protección de PUT / DELETE
mvn test -Dapi.tags=@smoke

# Solo autenticación inválida; no requiere credenciales válidas
mvn test -Dapi.tags=@auth

# Escenarios de reservas
mvn test -Dapi.tags=@booking

# Actualización parcial
mvn test -Dapi.tags=@patch

# PUT y DELETE sin token y con token inválido
mvn test -Dapi.tags=@authorization

# Abrir el reporte HTML en macOS
open target/karate-reports/karate-summary.html
```

El runner acepta un único tag por ejecución. Un tag inválido o sin escenarios hace fallar la ejecución para evitar resultados engañosos.

| Tag | Ejecuciones actuales |
| --- | --- |
| `@smoke` | 5: API-01 y los cuatro ejemplos de API-04 / API-05 |
| `@patch` | 1: actualización parcial API-02 |
| `@auth`, `@credencialesInvalidas` | 1 por selección: credenciales inválidas API-03 |
| `@authorization` | 4: dos ejemplos de API-04 y dos de API-05 |
| `@booking` | 6: API-01, API-02 y los cuatro ejemplos de autorización |
| `@regression` | 7: toda la suite actual |

## Estructura

```text
api/
├── pom.xml
├── .env.example
└── src/test/
    ├── java/pe/ligo/qa/ApiTest.java
    └── resources/
        ├── karate-config.js
        ├── logback-test.xml
        ├── features/
        ├── data/
        ├── schemas/
        └── support/
```

| Componente | Responsabilidad |
| --- | --- |
| `ApiTest.java` | Seleccionar escenarios por tag, ejecutar Karate y propagar fallos a Maven |
| `karate-config.js` | Resolver URL, credenciales, timeouts y enmascaramiento HTTP |
| `features/` | Escenarios y verificaciones de comportamiento |
| `data/` | Payloads de prueba sin credenciales |
| `schemas/` | Contratos de tipos y campos mediante los marcadores de Karate |
| `support/` | Autenticación reutilizable y limpieza de reservas |

Los esquemas usan fuzzy matching de Karate, no el estándar JSON Schema. Los datos esperados también se comparan con el payload enviado para comprobar el comportamiento, además de la estructura.

## Análisis de riesgos y alcance

La selección protege el flujo Autenticación → Crear → Consultar → Actualizar → Eliminar. P0 identifica fallos que impiden administrar una reserva o permiten modificar datos sin autorización; P1 cubre rechazos, contratos y variantes relevantes. El alcance actual automatiza cinco casos de diseño, equivalentes a siete ejecuciones: tres escenarios y cuatro ejemplos de dos `Scenario Outline`. API-06 queda fuera de la implementación de esta entrega.

| Riesgo | Impacto | Cobertura actual |
| --- | --- | --- |
| R-API-01: falla la autenticación válida o se emite un token con credenciales inválidas | Alto | API-01: token válido; API-03: rechazo sin token |
| R-API-02: la reserva creada o actualizada no conserva sus datos | Alto | API-01 y API-02: comparación completa del contenido y GET posteriores |
| R-API-03: cambian los tipos, campos o formato de respuesta esperados | Medio | API-01 y API-02: esquema y contenido; API-03: respuesta de rechazo; API-04 y API-05: contrato de la reserva conservada |
| R-API-04: una reserva eliminada continúa disponible | Alto | API-01: DELETE seguido de GET 404 |
| R-API-05: se puede actualizar o eliminar sin autorización | Alto | API-04 y API-05: rechazo sin token y con token inválido, seguido de GET sin cambios |

## Diseño de pruebas

Los casos conservan IDs estables. La columna Automatizado describe la implementación actual; las filas con No son cobertura diseñada pendiente, no resultados ejecutados.

| ID | Escenario / resultado esperado | Prioridad | Técnica | Automatizado |
| --- | --- | --- | --- | --- |
| API-01 | Credenciales válidas permiten crear una reserva, consultar sus datos, actualizarlos y eliminarla; las consultas posteriores reflejan cada cambio | P0 | Transición de estados y partición de equivalencia válida | Sí |
| API-02 | Actualizar un campo mediante PATCH conserva los campos no enviados y persiste el cambio | P1 | Transición de estados | Sí |
| API-03 | Credenciales inválidas devuelven `Bad credentials` sin emitir un token | P1 | Partición de equivalencia inválida | Sí |
| API-04 | PUT sin token o con token inválido rechaza la operación y conserva la reserva original; dos ejemplos | P0 | Tabla de decisión, partición inválida y Data Driven Testing | Sí |
| API-05 | DELETE sin token o con token inválido rechaza la operación y mantiene la reserva disponible; dos ejemplos | P0 | Tabla de decisión, partición inválida y Data Driven Testing | Sí |
| API-06 | Omitir un campo obligatorio impide crear una reserva; caracterizar la respuesta del servicio antes de fijar la aserción del error | P1 | Partición de equivalencia: campo presente / ausente | No |

### Justificación de la selección y técnicas

API-01 recorre los estados inexistente → creada → actualizada → eliminada. Se selecciona porque detecta interrupciones del flujo completo, pérdida de datos y respuestas correctas que no se reflejan en consultas posteriores. Las operaciones permanecen dentro de un escenario porque representan la vida de su propia reserva; no dependen de la ejecución de otro test.

API-03 representa la partición de credenciales inválidas y complementa la partición válida usada en API-01. Aporta una comprobación negativa pequeña e independiente. No cubre todas las combinaciones de usuario y contraseña ni demuestra que PUT y DELETE apliquen correctamente la autorización.

API-02 envía únicamente `lastname` en el PATCH y compara la respuesta completa y un GET posterior contra una copia del payload original con ese único cambio. La comparación antes/después es el oráculo de la transición: detecta tanto la falta de persistencia como la pérdida o alteración de los campos omitidos.

API-04 y API-05 cubren dos particiones de autorización mediante Data Driven Testing: token ausente y token inválido. Cada fila de `Examples` crea su propia reserva y ejecuta su propia limpieza. PUT intenta cambiar datos para que un GET posterior detecte una modificación indebida. DELETE comprueba con un GET que la reserva continúa existiendo y conserva todos sus valores.

### Tabla de decisión de autorización

| Estado del token | PUT | DELETE | Caso |
| --- | --- | --- | --- |
| Válido | 200 y datos actualizados | 201 y reserva ausente | API-01 |
| Ausente | 403 y datos originales | 403 y reserva conservada | API-04 y API-05: ejemplo sin token |
| Inválido | 403 y datos originales | 403 y reserva conservada | API-04 y API-05: ejemplo con token inválido |

Los esquemas comprueban el contrato y las comparaciones contra los payloads comprueban los valores. Son verificaciones complementarias: un tipo correcto no garantiza que el dato corresponda a lo enviado. Un GET independiente después de cada mutación comprueba la persistencia observable mediante la API; no se consulta directamente la base de datos.

Data Driven Testing se aplica a las variantes de autorización, con dos ejemplos por operación. No se presenta análisis de valores límite como implementado. Para ampliar campos obligatorios, API-06 puede convertirse en un `Scenario Outline`, variando un campo por ejemplo. Los límites de precio, longitud o fechas necesitan reglas acordadas antes de asignar resultados esperados.

### Reglas funcionales y validaciones implementadas

| Operación | Resultado esperado y verificación |
| --- | --- |
| Autenticación válida | HTTP 200 y un token de tipo string no vacío; el helper exige credenciales del entorno |
| Creación | HTTP 200, respuesta JSON, ID numérico positivo y reserva con el esquema y valores enviados |
| Consulta tras crear | HTTP 200, respuesta JSON y contenido completo igual al payload original |
| Actualización completa | HTTP 200, respuesta JSON y esquema; `lastname`, `totalprice` y `depositpaid` cambian a los valores enviados; los demás campos se conservan |
| Consulta tras actualizar | HTTP 200, respuesta JSON y contenido completo igual al payload actualizado, incluido `depositpaid: false` |
| Actualización parcial | PATCH con un único campo; HTTP 200, respuesta JSON, esquema y comparación completa con el cambio esperado; GET posterior con los mismos valores |
| Actualización sin autorización | PUT sin token y con token inválido: HTTP 403; GET posterior 200, respuesta JSON, esquema y contenido original completo |
| Eliminación sin autorización | DELETE sin token y con token inválido: HTTP 403; GET posterior 200, respuesta JSON, esquema y contenido original completo |
| Eliminación | HTTP 201 y consulta posterior con HTTP 404 para el mismo ID |
| Autenticación inválida | HTTP 200, respuesta JSON exactamente igual a `{ reason: 'Bad credentials' }`, sin token |

Los códigos reflejan el comportamiento de Restful Booker. No se presupone que una creación responda 201 o que un rechazo de autenticación responda 401. El esquema verifica el formato de las fechas, pero no acredita reglas como un orden obligatorio entre check-in y check-out ni un precio mínimo; esas restricciones no forman parte de las aserciones actuales.

### Exclusiones y siguientes ampliaciones

API-06 queda expresamente sin automatizar en esta entrega. Las entradas inválidas se ampliarán tras caracterizar los errores del servicio, evitando inventar códigos o reglas de negocio. Los negativos actuales cubren autorización ausente o inválida en PUT y DELETE; no incluyen PATCH sin autorización, tokens expirados ni autenticación Basic. Filtros de búsqueda, formatos XML, rendimiento y seguridad exhaustiva quedan fuera para concentrar la entrega funcional en el flujo de referencia y completar las otras capas.

## Matriz de trazabilidad

Cada fila relaciona el flujo, su riesgo, el caso diseñado y la fuente que contiene la verificación. Varias filas de API-01 pertenecen al mismo escenario, no a pruebas independientes. Los IDs API-01 a API-05 aparecen en los resultados de Karate; los nombres de los ejemplos de autorización distinguen token ausente e inválido.

| Requerimiento / flujo | Riesgo | Caso | Test automatizado / fuente | Verificación principal |
| --- | --- | --- | --- | --- |
| Obtener un token válido | R-API-01 | API-01 | [booking-lifecycle.feature](src/test/resources/features/booking-lifecycle.feature) → [authenticate.feature](src/test/resources/support/authenticate.feature) | HTTP 200 y token no vacío |
| Crear una reserva con contrato y contenido correctos | R-API-02 / R-API-03 | API-01 | [booking-lifecycle.feature](src/test/resources/features/booking-lifecycle.feature) → [booking.schema.json](src/test/resources/schemas/booking.schema.json) | POST: ID positivo, esquema y comparación con `booking` |
| Consultar la información creada | R-API-02 | API-01 | [booking-lifecycle.feature](src/test/resources/features/booking-lifecycle.feature) | GET del ID creado: igualdad completa con `booking` |
| Actualizar una reserva y conservar sus datos | R-API-02 / R-API-03 | API-01 | [booking-lifecycle.feature](src/test/resources/features/booking-lifecycle.feature) | PUT: esquema e igualdad con `updatedBooking`; GET posterior con los mismos valores |
| Eliminar la reserva y comprobar su ausencia | R-API-04 | API-01 | [booking-lifecycle.feature](src/test/resources/features/booking-lifecycle.feature) | DELETE 201 y GET posterior 404 |
| Rechazar credenciales inválidas | R-API-01 / R-API-03 | API-03 | [auth.feature](src/test/resources/features/auth.feature) | Respuesta de error exacta sin token |
| Actualizar parcialmente sin perder campos | R-API-02 / R-API-03 | API-02 | [booking-lifecycle.feature](src/test/resources/features/booking-lifecycle.feature), tag `@patch` | PATCH 200 y GET con comparación completa de campos modificados y conservados |
| Proteger la actualización sin autorización | R-API-05 | API-04 | [booking-authorization.feature](src/test/resources/features/booking-authorization.feature), primer `Scenario Outline` | Dos ejemplos: PUT 403 y GET 200 con datos originales |
| Proteger la eliminación sin autorización | R-API-05 | API-05 | [booking-authorization.feature](src/test/resources/features/booking-authorization.feature), segundo `Scenario Outline` | Dos ejemplos: DELETE 403 y GET 200 con la reserva original |
| Rechazar la creación con campos obligatorios ausentes | R-API-03 | API-06 | No automatizado | Pendiente: caracterizar el rechazo y comprobar sus efectos |

## Estrategia de datos y confiabilidad

[booking.json](src/test/resources/data/booking.json) contiene una reserva ficticia sin credenciales. API-01, API-02 y cada ejemplo de API-04/API-05 cargan su propia copia, agregan un UUID al nombre y obtienen el ID de la respuesta de creación. PUT válido cambia tres campos y PATCH válido cambia uno; ambos comparan el contenido completo. API-03 usa credenciales deliberadamente inválidas y no necesita que antes se ejecute otro caso.

Los casos de autorización obtienen un token válido únicamente para limpiar su reserva al finalizar. Después de preparar los datos, vacían las cookies almacenadas; la petición bajo prueba recibe un mapa de headers vacío o una cookie con token deliberadamente inválido según el ejemplo. El token válido no se envía en el PUT o DELETE negativo. La limpieza usa después su propio token válido y confirma un GET 404, incluso cuando el escenario falla.

El hook [cleanup-booking.js](src/test/resources/support/cleanup-booking.js) se ejecuta al terminar el escenario, pase o falle. Si existe un ID propio y la eliminación no se confirmó, llama a [delete-booking.feature](src/test/resources/support/delete-booking.feature), que admite una eliminación exitosa o una reserva ya ausente y exige un GET 404. Un fallo de limpieza también falla el escenario. No se eliminan reservas preexistentes ni se comparte una reserva entre tests. Si el servidor crea un registro pero la respuesta se pierde antes de recuperar el ID, esta limpieza no puede identificarlo: es una limitación del acceso exclusivamente por API.

El servicio público comparte datos con otros usuarios y puede reiniciarse. Se usa un hilo por defecto, sin reintentos automáticos. Ante un fallo, revisar status, respuesta y paso del reporte para distinguir una regresión, un fallo del test o indisponibilidad externa; no suavizar aserciones para obtener un resultado verde. Para escalar, añadir features por capacidad, casos con IDs y tags, y helpers cuando exista reutilización real; aumentar concurrencia solo después de comprobar el aislamiento y la capacidad del servicio.

## Configuración

Las pruebas se ejecutan contra el servicio desplegado en `https://restful-booker.herokuapp.com`.

| Opción | Predeterminado | Uso |
| --- | --- | --- |
| `API_BASE_URL` | `https://restful-booker.herokuapp.com` | Sobrescribir la URL mediante una variable de entorno |
| `api.baseUrl` | Sin valor | Sobrescribir la URL mediante `-D`; tiene prioridad sobre `API_BASE_URL` |
| `API_USERNAME`, `API_PASSWORD` | Sin valor | Credenciales exigidas por los escenarios que autentican |
| `api.tags` | `@regression` | Tag a ejecutar |
| `api.threads` | `1` | Número de hilos; mantener bajo contra el servicio público |

## Reportes y CI

Karate genera HTML en `target/karate-reports/karate-summary.html` y XML por feature en `target/karate-reports/junit-xml/`. Surefire genera su reporte en `target/surefire-reports/`. Maven muestra un test Java porque ese método ejecuta la suite; el reporte de Karate contiene las siete ejecuciones reales de los cinco casos automatizados.

Las trazas HTTP enmascaran credenciales, tokens y cabeceras de autenticación. El helper de autenticación usa `@report=false`. Evita añadir instrucciones `print` con datos sensibles: el enmascaramiento HTTP no protege impresiones arbitrarias. `target/` está excluido de Git.

El [workflow API](../.github/workflows/api.yml) requiere los secretos de Actions `API_USERNAME` y `API_PASSWORD`. Los valores se administran en GitHub, no en el código. Los PR desde forks no reciben esos secretos.

| Evento | Selección | Criterio |
| --- | --- | --- |
| Pull request con cambios en API o su workflow | `@smoke`: API-01, API-04 y API-05; cinco ejecuciones | Proteger el ciclo principal y el rechazo de cambios no autorizados, todos P0 |
| Push a `main`/`master`, incluido el merge | `@regression`: API-01 a API-05, siete ejecuciones | Comprobar los casos actuales sobre el código integrado |
| Nightly a las 03:00 de Lima, 08:00 UTC | `@regression`: API-01 a API-05, siete ejecuciones | Detectar cambios o indisponibilidad del servicio entre entregas |
| Manual | Un tag indicado en `tag` | Ejecutar una selección para diagnóstico o validación puntual |

Smoke contiene los casos P0: el recorrido completo API-01 y las cuatro variantes negativas de autorización de API-04 / API-05. Regresión añade PATCH y credenciales inválidas. Cada variante conserva su propia reserva y limpieza; la selección más amplia no introduce dependencias entre casos.

Con el workflow publicado en la rama predeterminada, abrir **Actions → API - Karate → Run workflow**, elegir la rama e indicar `@smoke`, `@booking`, `@patch`, `@authorization`, `@auth`, `@credencialesInvalidas` o `@regression`. Los dos tags de autenticación seleccionan actualmente API-03. El runner valida el tag y falla si no hay coincidencias.

Los reportes se suben como artefactos incluso si la suite falla y se conservan siete días. Descarga `api-karate-<intento>` para comprobar el HTML y los XML y conserva el de la entrega antes de que expire. GitHub puede iniciar el trabajo nocturno con retraso.

La [regresión nocturna correcta](https://github.com/Ronaldoa1698/reto-ligo/actions/runs/44921544070) corresponde al commit `b162626c8c65ecaf7fe779447f67df4aded1ee18` y sus siete ejecuciones. La ampliación de Smoke a cinco ejecuciones y las verificaciones adicionales de Content-Type requieren una nueva ejecución del código actualizado; ese resultado anterior no las acredita.

Referencias: [instalación de Karate v2](https://docs.karatelabs.io/getting-started/install-dependencies/), [logging y enmascaramiento](https://docs.karatelabs.io/running-tests/logging/), [contrato Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html).
