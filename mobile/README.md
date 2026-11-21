# Mobile · Appium + TypeScript

Automatización Android de **My Demo App 2.3.0**, con Appium 3.8.0, UiAutomator2 8.7.3, WebdriverIO 10.2.0 y Cucumber. El desarrollo y la ejecución se realizan desde VS Code y la terminal. El framework es propio de este reto.

## Prerrequisitos

| Herramienta | Versión / uso |
| --- | --- |
| Node.js | 24.22.3, declarada en `.nvmrc` |
| pnpm | 12.14.0, declarada en `package.json` |
| Java | JDK 21 con `JAVA_HOME` válido |
| Android | SDK, Platform-Tools, Build-Tools, emulador e imagen Android 14 / API 34 |
| Dispositivo | Emulador ARM64 en Apple Silicon; x86_64 en el runner Linux de CI |

Appium y el driver tienen requisitos compatibles con Node 24. El servidor, el runner, npm auxiliar, FFmpeg y el generador de reportes se instalan como dependencias del proyecto. pnpm administra el proyecto; npm se incluye únicamente porque Appium lo utiliza para instalar extensiones. No se requiere instalar Appium globalmente ni Android Studio.

Para consultar la versión instalada, ejecuta `pnpm exec appium --version` desde `mobile`. El comando `appium -v` puede no existir en la terminal porque la instalación es local al proyecto. El servicio de WebdriverIO inicia y detiene ese Appium automáticamente al ejecutar las pruebas.

## Preparación y ejecución local

Desde la raíz:

```bash
cd mobile
pnpm install --frozen-lockfile
pnpm run app:download
pnpm run driver:install
```

El APK se descarga de una [release oficial](https://github.com/saucelabs/my-demo-app-android/releases/tag/2.3.0). `config/app.ts` fija versión, nombre, paquete y SHA-256; la descarga rechaza contenido distinto y reutiliza el archivo existente si su checksum es correcto. El APK y el SDK no se versionan. El driver se instala en `mobile/.cache/appium`, sin reutilizar drivers de otros proyectos.

El archivo `.env` es opcional. Para personalizar la configuración de WebdriverIO:

```bash
cp .env.example .env
```

No sobrescribas un `.env` existente. WebdriverIO lo carga y conserva la prioridad de las variables ya exportadas. Las herramientas de Android y los comandos de instalación/diagnóstico utilizan las variables exportadas en la terminal; configura `JAVA_HOME`, `ANDROID_HOME` y `PATH` con los pasos siguientes.

### SDK sin Android Studio

En macOS con Homebrew, instala las herramientas de línea de comandos:

```bash
brew install --cask android-commandlinetools
export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
export ANDROID_HOME="$(brew --prefix)/share/android-commandlinetools"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Conserva esas variables en `~/.zshrc` si quieres reutilizarlas en nuevas terminales. Acepta las licencias solicitadas por las herramientas de Android:

```bash
sdkmanager --licenses
sdkmanager --sdk_root="$ANDROID_HOME" \
  "platform-tools" "emulator" "platforms;android-34" "build-tools;34.0.0" \
  "system-images;android-34;google_apis;arm64-v8a"

avdmanager create avd --name ligo_api34 \
  --package "system-images;android-34;google_apis;arm64-v8a" --device pixel_7
```

Los comandos anteriores utilizan los binarios clásicos incluidos en Command-line Tools; las distribuciones recientes muestran avisos de deprecación y también incluyen la CLI `android`. Se utiliza una imagen `arm64-v8a` en Apple Silicon; en equipos Intel/Linux corresponde `x86_64`.

La validación de este entorno preparó además un SDK y un AVD aislados en `mobile/.cache`. Si ya existen y quieres usarlos, exporta explícitamente estas rutas desde `mobile`, en cada terminal de ejecución:

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
export ANDROID_HOME="$PWD/.cache/android-sdk"
export ANDROID_USER_HOME="$PWD/.cache/android-user"
export ANDROID_AVD_HOME="$PWD/.cache/avd"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

Una clonación nueva debe preparar su propio SDK con los pasos anteriores. La configuración ya no busca automáticamente instalaciones del SDK.

### Iniciar el dispositivo y ejecutar

En una terminal dentro de `mobile`:

```bash
"$ANDROID_HOME/emulator/emulator" -avd ligo_api34 -no-audio
```

Abre una ventana independiente con Android. Déjala abierta y espera al arranque completo. En otra terminal de VS Code, también dentro de `mobile`:

```bash
adb devices
pnpm run doctor
pnpm run typecheck
pnpm run features:check
pnpm test
```

`ligo_api34` es el nombre del AVD creado con `avdmanager`; reemplázalo si tu dispositivo tiene otro nombre. Doctor debe indicar `0 required fixes needed`; algunas herramientas opcionales, como bundletool para AAB o GStreamer para streaming, no intervienen en los escenarios de este APK. `driver:install` se ejecuta durante la preparación inicial; para comprobar una instalación existente utiliza `pnpm exec appium driver list --installed` con `APPIUM_HOME="$PWD/.cache/appium"` o `pnpm run doctor`.

Doctor también puede avisar que FFmpeg no está en el `PATH` de la terminal. Durante las pruebas, `config/environment.ts` incorpora el binario local de `ffmpeg-static` para la grabación, sin instalación global.

WebdriverIO inicia y detiene el servidor Appium en `127.0.0.1:4723`. El dispositivo debe estar listo y el puerto disponible. Una ejecución real limpia los resultados generados anteriores; copia los artefactos que quieras conservar antes de iniciar otra.

### Ejecución por tags

```bash
pnpm run android
pnpm run test:smoke
pnpm run test:regression
TEST_TAG=@cart pnpm test
TEST_TAG=@checkout pnpm test
pnpm run features:check --tags @purchase
```

| Tag | Casos seleccionados |
| --- | --- |
| `@smoke`, `@purchase` | MOB-01: compra completa |
| `@cart` | MOB-02 y MOB-03: cantidades y eliminación |
| `@checkout` | MOB-04: nombre obligatorio |
| `@regression` | Los cuatro escenarios actuales; valor predeterminado |

Se acepta un único tag en `TEST_TAG`. Los scripts `test` y `android` ejecutan directamente `wdio run ./wdio.android.conf.ts`. La configuración valida el tag y el plan de Cucumber al cargarse, antes de que WDIO pueda omitir una selección vacía y terminar con éxito. Un tag inválido, errores de Gherkin o una selección vacía hacen fallar el comando. `features:check` valida la resolución de steps mediante dry-run sin dispositivo; permite filtrar con `--tags`, pero una selección vacía en ese dry-run no sustituye el control de una ejecución real.

## Arquitectura y localizadores

```text
mobile/
├── apps/android/                 # APK oficial descargado; fuera de Git
├── config/
│   ├── capabilities.android.ts   # Capabilities del dispositivo Android
│   ├── app.ts                    # Versión, paquete y checksum del APK
│   └── environment.ts            # Variables y rutas de herramientas
├── scripts/download-app.ts       # Descarga y verificación del APK
├── src/
│   ├── data/                     # Datos ficticios e importes esperados
│   ├── features/                 # Escenarios Gherkin con IDs y tags
│   ├── hooks/                    # Reinicio por escenario y evidencias de fallos
│   ├── pages/                    # BasePage y Pages por pantalla
│   ├── steps/                    # Steps separados por flujo
│   └── utils/money.ts             # Verificación del formato de importes
├── wdio.shared.conf.ts           # Runner, Cucumber, reportes y esperas comunes
├── wdio.android.conf.ts          # Configuración compartida + Android y Appium
├── pnpm-lock.yaml
└── .env.example
```

Se aplica Page Object Model siguiendo la estructura de referencia: cada Page encapsula sus elementos en getters y expone acciones y verificaciones. `BasePage` concentra `tap`, `type`, scroll y navegación al carrito. Los steps utilizan Pages y datos; no construyen selectores ni manipulan directamente el driver. Los localizadores se mantienen junto a la pantalla a la que pertenecen.

`wdio.shared.conf.ts` contiene Cucumber, rutas, reportes, esperas y límites de ejecución. `wdio.android.conf.ts` extiende esa configuración con las capabilities de `config/capabilities.android.ts`, el servicio Appium y las comprobaciones del dispositivo. `pnpm run android` y `pnpm test` utilizan esta configuración Android.

Cada Page exporta una instancia sin estado mutable del escenario (`export default new CartPage()`); los steps la importan directamente. Los getters buscan los elementos al utilizarlos. No se necesita un `World` personalizado ni un registro central de Pages. El hook `Before` limpia los datos de la aplicación antes de cada escenario, y `purchaseData()` devuelve datos nuevos en cada llamada. La captura de confirmación se guarda y adjunta a Allure en el paso que valida la compra, antes de regresar al catálogo.

Los selectores priorizan Accessibility ID (`~View cart`, `~Increase item quantity`, entre otros) cuando la descripción identifica un elemento de forma única en la pantalla. Los campos, importes y mensajes sin esa descripción usan `resource-id` nativo (`id=paquete:id/elemento`). El producto del catálogo conserva `UiSelector` por ID y nombre, y `fromParent` localiza la imagen pulsable de esa misma tarjeta: `Product Title` y `Product Image` se repiten entre productos y la etiqueta del nombre no abre el detalle. No se utilizan índices globales, XPath absoluto ni coordenadas en los Pages. Compartir los Accessibility IDs con iOS requeriría que ambas apps expongan los mismos valores; este reto valida Android.

`BasePage` usa `scrollIntoView` de WebdriverIO para alcanzar elementos fuera de pantalla sin interpretar su selector. El desplazamiento tiene un máximo de cinco gestos; normalmente desliza hacia arriba para avanzar en el formulario y hacia abajo para volver al error del nombre. Los formularios cierran el teclado después de cada entrada. Las esperas observan visibilidad y resultados; no hay pausas fijas escritas en los tests. La app se ejecuta en inglés y locale US para mantener consistente el formato de precios.

`src/utils` conserva únicamente `money.ts`, utilizado por los Pages para comprobar importes. Los datos viven en `src/data/purchase.data.ts`; la descarga reproducible vive en `scripts/download-app.ts`. La instalación/diagnóstico de Appium se ejecuta con comandos directos de `package.json`, fijando `APPIUM_HOME` a la caché del proyecto. El emulador se inicia con su CLI y WDIO ejecuta las pruebas directamente.

## Análisis de riesgos y alcance

El flujo seleccionado es Catálogo → Detalle → Carrito → Login de demo → Envío → Pago simulado → Resumen → Confirmación. P0 protege la operación principal y sus importes; P1 cubre modificaciones del carrito y un rechazo de datos obligatorios. Se trabaja con un producto de referencia para completar las tres capas del reto dentro de su plazo.

| Riesgo | Impacto | Cobertura |
| --- | --- | --- |
| R-MOB-01: no se puede completar la operación principal | Alto | MOB-01: compra completa y confirmación |
| R-MOB-02: cambian producto, cantidad o importes | Alto | MOB-01: detalle, carrito y resumen; MOB-02: cantidades |
| R-MOB-03: un producto eliminado permanece en el carrito | Medio | MOB-03: eliminación y estado vacío |
| R-MOB-04: checkout permite continuar sin un dato obligatorio | Medio | MOB-04: nombre vacío con los demás datos válidos |
| R-MOB-05: datos de un test contaminan el siguiente | Alto | Hook Before: terminar app, borrar datos y activar de nuevo; Pages sin estado mutable y datos nuevos al solicitarlos |

## Diseño de pruebas

| ID | Escenario / resultado esperado | Prioridad | Técnica | Automatizado |
| --- | --- | --- | --- | --- |
| MOB-01 | Compra conserva producto, cantidad e importes, confirma el pedido y deja el carrito vacío al continuar comprando | P0 | Transición de estados y partición válida | Sí |
| MOB-02 | Aumentar de 1 a 2 y reducir a 1 actualiza el importe sin cambiar el precio unitario | P1 | Transición de estados y cálculo independiente | Sí |
| MOB-03 | Eliminar el único producto muestra el carrito vacío | P1 | Transición de estados: con producto → vacío | Sí |
| MOB-04 | Nombre de envío vacío impide avanzar y muestra el error correspondiente, con el resto de datos válidos | P1 | Partición de equivalencia inválida | Sí |
| MOB-05 | Compra con otros productos, incluido Bolt T-Shirt, conserva la cantidad elegida | P1 | Partición de equivalencia por producto | No |
| MOB-06 | Cantidad cero en detalle deshabilita agregar al carrito | P2 | Valor límite inferior y transición de estado | No |

MOB-01 concentra el mayor riesgo de negocio e incluye verificaciones distintas para producto, precio, envío, total y cierre del carrito. MOB-02 añade cambios de cantidad que el caso de una unidad no cubre. MOB-03 valida la eliminación y MOB-04 atribuye el rechazo a un único dato inválido. Los cuatro casos se preparan de forma independiente.

No se presenta Data Driven Testing ni análisis exhaustivo de valores límite como implementados. Se automatiza la partición vacía del nombre; otros campos obligatorios, formatos y longitudes quedan para ampliar después de definir sus reglas.

### Datos y reglas de la demo

[purchase.data.ts](src/data/purchase.data.ts) crea una copia nueva en cada llamada: Sauce Labs Backpack a US$29.99, envío de referencia US$5.99 y comprador ficticio. Los casos actuales utilizan referencias fijas, sin compartir resultados mutables entre steps. La compra de una unidad espera US$35.98. Los importes esperados se calculan en centavos a partir de esas referencias; no se extrae el total de la propia app para construir el resultado esperado.

Los valores provienen de la versión fijada: [catálogo de referencia](https://github.com/saucelabs/my-demo-app-android/blob/2.3.0/app/src/main/java/com/saucelabs/mydemoapp/android/utils/base/BaseActivity.java) y [cálculo del resumen](https://github.com/saucelabs/my-demo-app-android/blob/2.3.0/app/src/main/java/com/saucelabs/mydemoapp/android/view/fragments/PlaceOrderFragment.java). Deben revisarse si se cambia el APK.

El login pulsa la cuenta de demostración que ofrece la propia aplicación; la app rellena sus campos. No se almacenan credenciales en código ni se requieren secretos de login en CI. Los datos de pago son ficticios y se usan exclusivamente en la simulación de la demo. La confirmación no acredita un cobro, envío o pedido real en un backend.

El código de esta versión incluye comportamientos deliberados: Bolt T-Shirt modifica la cantidad al agregar al carrito, y eliminar un producto bloquea el hilo de UI durante unos segundos. La variante del producto queda como MOB-05 pendiente; el caso de eliminación espera el resultado observable con el timeout configurado. Estas limitaciones no se presentan como funcionalidades aprobadas para todos los productos.

### Exclusiones justificadas

La primera entrega usa un emulador, un nivel Android y un producto. Otros productos, compras con varios artículos, rotación, interrupciones, accesibilidad completa, rendimiento, autenticación negativa y flujos secundarios quedan fuera por el alcance y el plazo. iOS queda fuera del reto Android. No se modifica la aplicación para facilitar las pruebas ni se reutilizan escenarios de otra app.

## Matriz de trazabilidad

Los nombres de los escenarios conservan los IDs para relacionar diseño, código y reportes.

| Requerimiento / flujo | Riesgo | Caso | Fuente automatizada | Verificación |
| --- | --- | --- | --- | --- |
| Catálogo y detalle del producto | R-MOB-01 / R-MOB-02 | MOB-01 a MOB-04 | [catalog.steps.ts](src/steps/catalog.steps.ts) → [CatalogPage](src/pages/CatalogPage.ts) y [ProductPage](src/pages/ProductPage.ts) | Producto de referencia disponible y precio correcto |
| Producto e importes durante la compra | R-MOB-02 | MOB-01 | [purchase.feature](src/features/purchase.feature) → [CartPage](src/pages/CartPage.ts) y [ReviewPage](src/pages/ReviewPage.ts) | Producto, cantidad, precio, envío y total |
| Login y datos de checkout | R-MOB-01 | MOB-01 | [checkout.steps.ts](src/steps/checkout.steps.ts) → [LoginPage](src/pages/LoginPage.ts), [ShippingPage](src/pages/ShippingPage.ts) y [PaymentPage](src/pages/PaymentPage.ts) | Cuenta de demo, envío y pago ficticio permiten llegar al resumen |
| Confirmación y carrito vacío | R-MOB-01 / R-MOB-03 | MOB-01 | [purchase.feature](src/features/purchase.feature) → [purchase.steps.ts](src/steps/purchase.steps.ts) | Confirmación visible, captura y carrito vacío tras continuar |
| Modificar cantidades | R-MOB-02 | MOB-02 | [cart.feature](src/features/cart.feature) → [CartPage](src/pages/CartPage.ts) | Cantidades 1 → 2 → 1 e importes esperados |
| Eliminar producto | R-MOB-03 | MOB-03 | [cart.feature](src/features/cart.feature) | Carrito vacío tras eliminar |
| Nombre obligatorio | R-MOB-04 | MOB-04 | [checkout.feature](src/features/checkout.feature) → [ShippingPage](src/pages/ShippingPage.ts) | Error específico de nombre obligatorio |
| Aislamiento | R-MOB-05 | MOB-01 a MOB-04 | [cucumber.hooks.ts](src/hooks/cucumber.hooks.ts) y [purchase.data.ts](src/data/purchase.data.ts) | Datos de app limpios, Pages sin estado mutable y datos nuevos al solicitarlos |
| Otros productos y cantidad cero | R-MOB-02 | MOB-05 / MOB-06 | No automatizados | Cobertura pendiente indicada en diseño |

## Confiabilidad y configuración

Se ejecuta una sesión a la vez y los features se agrupan en un worker. Antes de cada escenario se termina la aplicación, se comprueba que su proceso esté detenido, se borran sus datos y se inicia con `startActivity` esperando la actividad. El catálogo dispone de una espera explícita de hasta 30 segundos para la inicialización de la base local de la demo. Esto evita avanzar mientras Android todavía procesa el reinicio. Esta limpieza afecta únicamente al paquete de My Demo App; usa un emulador o dispositivo de pruebas. El navegador de Web y las reservas de API no intervienen.

No hay reintentos de escenario, feature ni conexión que conviertan un fallo en éxito. Ante un fallo se revisan screenshot, jerarquía XML, video, Appium y logcat para distinguir un defecto, un localizador incorrecto o un problema de infraestructura. Concurrencia y matriz de dispositivos se ampliarán después de validar capacidad y aislamiento por dispositivo.

| Variable | Uso |
| --- | --- |
| `ANDROID_HOME` | Ruta explícita al SDK, exportada en la terminal o definida en `.env` para WDIO |
| `ANDROID_UDID` | Serial de `adb devices`; obligatorio si hay varios dispositivos |
| `ANDROID_PLATFORM_VERSION` | `14` por defecto |
| `ANDROID_APP_PATH` | APK alternativo; debe ser compatible con los localizadores y datos de esta versión |
| `TEST_TAG` | Tag único; `@regression` por defecto |

## Reportes y evidencias

```bash
pnpm run report
pnpm run report:open
```

El primer comando genera HTML en `allure-report/`; el segundo lo sirve y abre en el navegador. Java 21 debe estar disponible. También se generan resultados Allure en `allure-results/` y XML JUnit en `reports/junit/`.

MOB-01 captura la confirmación incluso si la compra pasa. En fallos se recogen screenshot, jerarquía XML, logcat y video MP4; la grabación de escenarios correctos se descarta. Los adjuntos se conservan en `artifacts/` y se vinculan al reporte. Un error al recoger evidencia se informa sin reemplazar el fallo original del test.

Los reportes completos, APK, cachés y artefactos están excluidos de Git. Revisar los adjuntos antes de compartirlos; las pantallas pueden mostrar los datos de demostración que ofrece la aplicación. La [captura de confirmación](evidence/purchase-confirmation.png) se conserva como evidencia selectiva del flujo validado.

La regresión local de los cuatro escenarios pasó en Android 14 / API 34 ARM64, en un único worker y sin reintentos. Allure y JUnit registran los cuatro casos; el reporter de consola también muestra el conteo de steps. Esta validación no sustituye la ejecución Linux de GitHub Actions ni una matriz de dispositivos.

## GitHub Actions

El [workflow Mobile](../.github/workflows/mobile.yml) prepara Node, pnpm, Java y un emulador Android 14 x86_64 con KVM. Descarga el mismo APK con checksum, instala el driver fijado y ejecuta las verificaciones previas antes de iniciar las pruebas.

| Evento | Selección | Justificación |
| --- | --- | --- |
| PR con cambios en Mobile o su workflow | `@smoke`: MOB-01 | Detectar pronto interrupciones en el recorrido principal |
| Push a `main`/`master`, incluido merge | `@regression`: cuatro escenarios | Validar el código integrado y los negativos seleccionados |
| Nightly, 03:00 de Lima / 08:00 UTC | `@regression` | Detectar cambios de infraestructura y regresiones entre entregas |
| Manual | Tag del campo `tag` | Ejecutar una selección para diagnóstico |

Para la ejecución manual, publicar el workflow en la rama predeterminada y abrir **Actions → Mobile - Appium → Run workflow**. Se admiten `@purchase`, `@cart`, `@checkout`, `@smoke` o `@regression`. La entrada se transmite por variable de entorno y el runner la valida; no se interpola directamente en un comando de shell.

El HTML y los artefactos se publican también cuando las pruebas fallan y se conservan siete días. Esta configuración no acredita una ejecución remota: después de publicar, comprobar el PR, el merge y una ejecución manual, descargar sus artefactos y verificar el resultado de esta misma versión. El horario se activa en la rama predeterminada y puede iniciarse con retraso.

## Decisiones y presentación

La demostración del reto debe mostrar un feature, su step, el Page y el locator; explicar el reset de datos, los importes independientes, la cuenta de demo y una exclusión. Mostrar la compra, la captura y el reporte. Como siguientes mejoras: ampliar productos, límites y negativos; validar otra versión Android y un dispositivo físico; medir estabilidad y duración antes de introducir paralelismo. El video global de 10–15 minutos debe integrar Web, API y Mobile y queda como entregable de presentación.

Referencias: [Appium](https://appium.io/docs/en/3.2/), [UiAutomator2](https://appium.github.io/appium-uiautomator2-driver/), [WebdriverIO](https://webdriver.io/docs/gettingstarted), [Android por línea de comandos](https://developer.android.com/studio/run/emulator-commandline).
