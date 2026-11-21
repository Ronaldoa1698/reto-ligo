# Web · SauceDemo

Automatización con Playwright Test, TypeScript y playwright-bdd. Los escenarios usan palabras clave Gherkin en inglés (`Feature`, `Background`, `Scenario`, `Given`, `When`, `Then`, `And`) y descripciones en español. Cubren el acceso y el flujo completo de compra: catálogo → carrito → checkout → confirmación.

## Prerrequisitos

- Node.js 24.x. La versión de referencia está en `.nvmrc`: **24.22.3**.
- pnpm **12.14.0**, fijado en el campo `packageManager` de `package.json`.
- Acceso a internet para instalar dependencias, descargar Chromium y acceder a SauceDemo.
- Un usuario válido de la demo y su contraseña, publicados en la pantalla de login de [SauceDemo](https://www.saucedemo.com/).

Dependencias fijadas en `package.json` y `pnpm-lock.yaml`: Playwright **1.65.1**, playwright-bdd **9.2.1**, TypeScript **7.0.2** y tipos de Node **24.19.2**. Se usa pnpm para mantener un único lockfile.

La instalación independiente de pnpm puede funcionar sin que exista el comando `node`. Para preparar Node de forma persistente en tu entorno de usuario, con pnpm 12 ya instalado:

```bash
pnpm runtime set node 24.22.3 -g
node --version
pnpm --version
```

Si tu terminal todavía no encuentra Node, abre una terminal nueva o ejecuta `rehash` en zsh. El directorio `$PNPM_HOME/bin` debe estar en el `PATH`; el instalador de pnpm configura ese acceso. Esta instalación de Node queda disponible también para otros proyectos y no depende de una carpeta temporal.

`pnpm runtime` instala Node sin incluir npm/npx. Este proyecto no los necesita: los scripts se ejecutan con `pnpm run` y los binarios de las dependencias con `pnpm exec`. Consulta la [instalación de pnpm](https://pnpm.io/installation) y la [gestión de runtimes](https://pnpm.io/cli/runtime) para preparar otro equipo. Si ya administras Node con nvm, puedes seguir usando `nvm install` y `nvm use` dentro de `web`.

`.nvmrc` declara la versión de Node de referencia; no instala Node ni lo cambia automáticamente al entrar a la carpeta. GitHub Actions también lee ese archivo mediante `node-version-file`, aunque localmente uses pnpm para administrar Node.

## Instalación

Desde la raíz del repositorio:

```bash
cd web
pnpm install --frozen-lockfile
pnpm run browsers:install
```

En un clon nuevo, copia `.env.example` a `.env` con `cp .env.example .env`. Si ya tienes `.env`, conserva su contenido.

Completa `SAUCE_USERNAME` y `SAUCE_PASSWORD` en `.env` con los datos de un usuario estándar válido de SauceDemo. `BASE_URL` permite cambiar la URL objetivo. Las variables de entorno del proceso tienen prioridad sobre `.env`.

Las credenciales se requieren para el acceso positivo, el usuario bloqueado y todos los escenarios que parten de una sesión iniciada. El perfil bloqueado se obtiene del listado público de usuarios en la pantalla de login y utiliza la contraseña de la demo; no requiere otra credencial en el repositorio. Si falta configuración, los tests afectados fallan con un mensaje explícito. `.env` está excluido de Git y no debe reemplazarse por valores reales en `.env.example`.

## Ejecución

```bash
pnpm run typecheck
pnpm test
```

Los scripts de pruebas ejecutan `bddgen` antes de Playwright. Esta generación convierte los archivos `.feature` en tests dentro de `.features-gen/` y falla si un paso no tiene implementación. No es necesario ejecutar el generador por separado para correr la suite.

| Comando | Uso |
| --- | --- |
| `pnpm run bdd:generate` | Generar los tests y validar que todos los pasos estén definidos |
| `pnpm run test:smoke` | Formulario, acceso válido y compra completa |
| `pnpm run test:regression` | Todos los casos seleccionados actualmente |
| `pnpm run test:headed` | Ejecutar con el navegador visible |
| `pnpm run test:ui` | Abrir la interfaz de Playwright |
| `pnpm run test:debug` | Depurar con Playwright Inspector |
| `pnpm run test:list` | Enumerar casos sin abrir el navegador |
| `pnpm run report` | Abrir el último reporte HTML |

La suite completa tiene **9 ejecuciones**: 4 de login, 1 de carrito, 3 ejemplos de checkout y 1 de compra. Smoke contiene **3 ejecuciones**: formulario disponible, login válido y compra completa.

Para filtrar un escenario por su ID, ejecuta `pnpm test --grep WEB-LOGIN-02`. En modo UI, si editas un archivo `.feature`, ejecuta `pnpm run bdd:generate` desde otra terminal para actualizar los tests disponibles. También puedes cerrar y volver a abrir `pnpm run test:ui`.

Para ejecutar únicamente el flujo de compra:

```bash
pnpm test --grep WEB-PURCHASE-01
```

También puedes seleccionar la compra por su tag de funcionalidad: `pnpm test --grep @purchase`.

Para comprobar el formulario y el rechazo de acceso sin configurar credenciales:

```bash
pnpm test --grep 'WEB-LOGIN-01|WEB-LOGIN-03'
```

En Linux/CI, instala también las dependencias del sistema del navegador con `pnpm exec playwright install --with-deps chromium`.

## Análisis de riesgos y alcance

El objetivo es proteger el flujo Login → Productos → Carrito → Checkout → Confirmación. Se priorizan el impacto en la compra y el valor de detectar el fallo pronto. P0 identifica interrupciones del flujo principal o importes incorrectos; P1 cubre estados negativos y cambios relevantes del carrito; P2 corresponde a cobertura complementaria para una siguiente versión. El plazo de dos días del reto también debe cubrir API y Mobile.

| Riesgo | Impacto / prioridad | Cobertura seleccionada |
| --- | --- | --- |
| R-WEB-01: un comprador válido no puede acceder | Alto / P0 | WEB-LOGIN-01 y WEB-LOGIN-02 |
| R-WEB-02: se acepta acceso inválido o bloqueado | Alto / P1 | WEB-LOGIN-03 y WEB-LOGIN-04 |
| R-WEB-03: producto, cantidad o precio cambian durante la compra | Alto / P0 | WEB-PURCHASE-01: carrito y resumen |
| R-WEB-04: subtotal, impuesto o total son incorrectos | Alto / P0 | WEB-PURCHASE-01: importes contra datos de referencia |
| R-WEB-05: un producto eliminado vuelve a aparecer | Medio / P1 | WEB-CART-01: eliminación y recarga |
| R-WEB-06: checkout avanza con datos obligatorios incompletos | Medio / P1 | WEB-CHECKOUT-01: tres ejemplos independientes |
| R-WEB-07: la compra no termina o deja productos en el carrito | Alto / P0 | WEB-PURCHASE-01: confirmación y carrito vacío |

La prioridad del riesgo indica su impacto; la del caso indica el orden de ejecución. Para R-WEB-01, el acceso válido es P0 porque demuestra que el comprador puede entrar. La disponibilidad del formulario es una comprobación complementaria P1, incluida en Smoke por su bajo costo.

## Diseño de pruebas

Se conservan los IDs en los nombres de escenario para relacionarlos con los resultados. La selección incluye los casos automatizados y las exclusiones, con el formato pedido por el reto.

| ID | Escenario / resultado esperado | Prioridad | Técnica | Automatizado |
| --- | --- | --- | --- | --- |
| WEB-LOGIN-01 | Inicio → login: campos visibles y botón de acceso disponible | P1 | Prueba basada en estados: estado inicial anónimo | Sí |
| WEB-LOGIN-02 | Credenciales válidas permiten ver el catálogo | P0 | Partición de equivalencia válida | Sí |
| WEB-LOGIN-03 | Credenciales inválidas muestran el error correspondiente y conservan el formulario | P1 | Partición de equivalencia inválida | Sí |
| WEB-LOGIN-04 | Una cuenta bloqueada recibe el error de bloqueo y permanece en login | P1 | Tabla de decisión: estado de la cuenta y credenciales | Sí |
| WEB-CART-01 | Agregar → eliminar → recargar: el carrito permanece vacío | P1 | Transición de estados | Sí |
| WEB-CHECKOUT-01 | Un campo obligatorio vacío impide avanzar y muestra su error; tres ejemplos | P1 | Partición de equivalencia y Data Driven Testing | Sí |
| WEB-PURCHASE-01 | Compra completa conserva producto, cantidad e importes, confirma el pedido y vacía el carrito | P0 | Transición de estados y partición válida | Sí |
| WEB-LOGIN-05 | Mensajes de campos de login vacíos | P2 | Partición de equivalencia inválida | No |
| WEB-CATALOG-01 | Ordenamiento del catálogo | P2 | Partición de equivalencia por criterio de orden | No |
| WEB-PURCHASE-02 | Compra con varios productos | P1 | Combinación de datos y cálculo de importes | No |
| WEB-USERS-01 | Compra con otros perfiles especiales de la demo | P2 | Partición de equivalencia por perfil | No |

El login y la compra completa detectan interrupciones P0. El negativo de credenciales y el perfil bloqueado distinguen causas diferentes de rechazo. El carrito valida una transición que podría dejar productos obsoletos. Checkout varía un campo a la vez y conserva válidos los otros dos, para atribuir cada fallo a una causa concreta.

### Tabla de decisión de acceso

| Usuario / estado de la cuenta | Contraseña | Resultado esperado | Caso |
| --- | --- | --- | --- |
| Usuario válido activo | Válida | Catálogo visible | WEB-LOGIN-02 |
| Usuario inexistente | Inválida | Error de credenciales y formulario disponible | WEB-LOGIN-03 |
| Usuario bloqueado | Válida de la demo | Error de bloqueo y formulario disponible | WEB-LOGIN-04 |

Son las combinaciones seleccionadas; no se prueban por separado usuario activo con contraseña incorrecta ni usuario inexistente con contraseña válida.

### Datos de checkout

`checkout.feature` utiliza un `Scenario Outline`. Cada fila genera un test con su propia sesión y carrito; no son tres intentos dentro de un mismo test.

| Campo vacío | Otros campos | Resultado esperado |
| --- | --- | --- |
| `firstName` | Válidos | `Error: First Name is required` |
| `lastName` | Válidos | `Error: Last Name is required` |
| `postalCode` | Válidos | `Error: Postal Code is required` |

No se asignan límites máximos de longitud ni formatos de código postal sin una regla especificada. Los tres casos prueban la partición vacía frente a los datos válidos; no se presentan como una cobertura exhaustiva de valores límite.

### Exclusiones justificadas

Los mensajes de login vacío y el ordenamiento aportan menos valor que los estados seleccionados para el flujo principal. La compra con varios productos queda como primera ampliación funcional: esta entrega verifica un producto de referencia con datos e importes independientes. Los perfiles especiales restantes requieren definir sus comportamientos esperados, porque la demo incluye anomalías deliberadas.

Firefox/WebKit, regresión visual, accesibilidad completa, carga y seguridad exhaustiva quedan fuera de esta entrega funcional por el plazo y la cobertura de tres capas del reto. Estas exclusiones son decisiones de alcance, no afirmaciones de que esas áreas funcionan correctamente.

## Matriz de trazabilidad

Cada nombre de test generado conserva su ID y, en checkout, el campo del ejemplo. Los reportes HTML y JUnit permiten identificar el resultado de cada uno.

| Requerimiento / flujo | Riesgo | Caso | Fuente automatizada | Page / verificación principal |
| --- | --- | --- | --- | --- |
| Disponibilidad del login | R-WEB-01 | WEB-LOGIN-01 | [login.feature](src/resources/feature/login.feature) → [login.steps.ts](src/playwright/steps/login.steps.ts) | `LoginPage.expectFormVisible()` |
| Acceso válido al catálogo | R-WEB-01 | WEB-LOGIN-02 | [login.feature](src/resources/feature/login.feature) → [login.steps.ts](src/playwright/steps/login.steps.ts) | `InventoryPage.expectCatalogVisible()` |
| Rechazo de credenciales inválidas | R-WEB-02 | WEB-LOGIN-03 | [login.feature](src/resources/feature/login.feature) → [login.steps.ts](src/playwright/steps/login.steps.ts) | Error específico y formulario disponible |
| Rechazo de cuenta bloqueada | R-WEB-02 | WEB-LOGIN-04 | [login.feature](src/resources/feature/login.feature) → [login.steps.ts](src/playwright/steps/login.steps.ts) | `LoginPage.expectLockedUserError()` |
| Actualización del carrito | R-WEB-05 | WEB-CART-01 | [cart.feature](src/resources/feature/cart.feature) → [cart.steps.ts](src/playwright/steps/cart.steps.ts) | `CartPage.expectEmpty()` antes y después de recargar |
| Campos obligatorios del comprador | R-WEB-06 | WEB-CHECKOUT-01, ejemplos `firstName`, `lastName`, `postalCode` | [checkout.feature](src/resources/feature/checkout.feature) → [checkout.steps.ts](src/playwright/steps/checkout.steps.ts) | Error esperado y formulario disponible |
| Compra: producto, cantidad e importes | R-WEB-03 / R-WEB-04 | WEB-PURCHASE-01 | [purchase.feature](src/resources/feature/purchase.feature) → [purchase.steps.ts](src/playwright/steps/purchase.steps.ts) | `CartPage.expectOnlyProduct()` y `CheckoutOverviewPage.expectOrderSummary()` |
| Confirmación y cierre del carrito | R-WEB-07 | WEB-PURCHASE-01 | [purchase.feature](src/resources/feature/purchase.feature) → [purchase.steps.ts](src/playwright/steps/purchase.steps.ts) | `CheckoutCompletePage.expectOrderConfirmed()` y carrito vacío |

### Datos y validaciones de la compra

`src/playwright/data/purchase.data.ts` crea datos nuevos para cada escenario: un producto de referencia y un comprador ficticio. Para Sauce Labs Backpack se utiliza precio unitario de **US$29.99**, cantidad **1** e impuesto de referencia de **US$2.40**, observados al explorar la demo. El subtotal esperado es **US$29.99** y el total esperado **US$32.39**. El precio y el impuesto son datos de referencia explícitos que deben revisarse si cambia el catálogo de la demo.

Los cálculos se realizan en centavos para evitar errores de precisión decimal. El carrito y el resumen se comparan contra esos datos; el total esperado se obtiene sumando el subtotal esperado y el impuesto de referencia. Las nuevas verificaciones se centran en producto, cantidad, importes y confirmación, sin exigir rutas de URL ni títulos de navegación.

El `Background` de compra inicia sesión dentro del propio escenario. Cada ejecución recibe un contexto de navegador nuevo, sus propios Page Objects y una copia de los datos: la compra no depende de que antes se ejecute un caso de login.

## Arquitectura y configuración

```text
web/
├── src/
│   ├── playwright/
│   │   ├── data/purchase.data.ts       # Producto, comprador ficticio e impuesto esperado
│   │   ├── fixtures/test.ts           # Pages, credenciales y enlace con BDD
│   │   ├── locators/
│   │   │   ├── login.locators.ts      # Elementos de la pantalla de acceso
│   │   │   ├── inventory.locators.ts  # Elementos del catálogo
│   │   │   ├── cart.locators.ts
│   │   │   ├── checkout-information.locators.ts
│   │   │   ├── checkout-overview.locators.ts
│   │   │   └── checkout-complete.locators.ts
│   │   ├── pages/
│   │   │   ├── login.page.ts          # Acciones de acceso
│   │   │   ├── inventory.page.ts      # Catálogo y selección de productos
│   │   │   ├── cart.page.ts
│   │   │   ├── checkout-information.page.ts
│   │   │   ├── checkout-overview.page.ts
│   │   │   └── checkout-complete.page.ts
│   │   ├── steps/
│   │   │   ├── login.steps.ts
│   │   │   ├── cart.steps.ts
│   │   │   ├── checkout.steps.ts
│   │   │   └── purchase.steps.ts
│   │   ├── types/purchase.types.ts    # Contratos de los datos de prueba
│   │   └── utils/money.ts             # Formato de importes en dólares
│   └── resources/
│       └── feature/
│           ├── login.feature
│           ├── cart.feature
│           ├── checkout.feature
│           └── purchase.feature
├── evidence/                          # Captura de confirmación seleccionada
├── .features-gen/                     # Tests generados; no se editan manualmente
├── playwright.config.ts               # Configuración BDD y del runner de Playwright
├── tsconfig.json                      # Comprobación estricta de tipos
└── .env.example                       # Variables sin credenciales reales
```

La estructura combina Gherkin, Page Object Model y fixtures. Los `.feature` describen el comportamiento esperado; los steps coordinan llamadas a métodos de los Page Objects y reciben datos mediante fixtures. Los Pages implementan las interacciones y verificaciones de cada pantalla con las aserciones de Playwright. Las clases de `src/playwright/locators/` contienen las definiciones de localizadores y cada Page Object mantiene su instancia en una propiedad `private readonly locators`. Los steps no acceden directamente a localizadores ni al objeto `page`. Los escenarios se ejecutan con el runner de Playwright mediante [playwright-bdd](https://vitalets.github.io/playwright-bdd/).

El texto «Como / Quiero / Para» bajo `Feature` describe quién usa la funcionalidad, qué necesita y con qué objetivo. Es documentación opcional y no se ejecuta. El `Background`, colocado antes del primer escenario, sí se ejecuta antes de cada escenario del feature.

`src/playwright/fixtures/test.ts` extiende el `test` base de playwright-bdd mediante `base.extend()`. Proporciona los Page Objects de login, inventario, carrito y checkout, los datos de compra y las credenciales del entorno cuando los pasos los necesitan. Los Page Objects usan la misma `page` dentro de un escenario. `use(valor)` entrega el recurso al escenario; `createBdd(test)` conecta esa instancia de test con `Given`, `When` y `Then`. La fixture `page` sigue siendo administrada por Playwright y cada escenario recibe un contexto de navegador limpio. El step de confirmación utiliza `$testInfo` para adjuntar la evidencia capturada por el Page Object.

Los archivos `*.spec.js` de `.features-gen/` se regeneran antes de ejecutar y están excluidos de Git. La fuente que mantenemos está dentro de `src/`: features, steps, Page Objects, localizadores, fixtures y datos de prueba. `@regression` se hereda desde cada característica y `@smoke` identifica los tres escenarios de la suite rápida. Los tags `@login`, `@cart`, `@checkout` y `@purchase` permiten seleccionar cada capacidad por separado.

Para incorporar otra pantalla, añade sus localizadores en `src/playwright/locators/`, el Page Object en `src/playwright/pages/` y su fixture si los pasos necesitan recibirlo. Los nuevos pasos van en `src/playwright/steps/` y los escenarios en archivos con extensión `.feature` dentro de `src/resources/feature/`. La configuración descubre los nuevos archivos por esos patrones.

Los localizadores usan roles o `data-test`, configurado como atributo de test ID de SauceDemo. Las esperas son las propias de Playwright y de sus aserciones; no se usan pausas fijas.

Las verificaciones de login e inventario observan el formulario, el error relevante o un producto visible. No dependen de la ruta exacta ni del título del navegador. Los Pages agrupan condiciones del mismo resultado; carrito y resumen conservan comprobaciones distintas de producto, cantidad y dinero porque corresponden a riesgos diferentes.

Solo se configura Chromium en esta etapa. Se permiten dos workers locales y uno en CI para limitar concurrencia contra el sitio público. No hay reintentos locales; CI permite uno para obtener diagnóstico. `failOnFlakyTests` hace fallar la ejecución si un caso solo pasa tras reintentar. TypeScript se comprueba por separado porque la ejecución de Playwright no reemplaza el chequeo de tipos.

## Reportes y evidencias

Después de ejecutar:

- `playwright-report/index.html`: reporte HTML.
- `reports/junit.xml`: resultados JUnit para CI.
- `test-results/`: screenshots, trace y video de las pruebas fallidas.

`WEB-PURCHASE-01` adjunta una captura de la confirmación al reporte, incluso cuando la compra pasa correctamente. Después abre el carrito y comprueba que no quedan productos. Los tests correctos no conservan trace ni video. Para inspeccionar un trace fallido, ejecuta `pnpm exec playwright show-trace` seguido de la ruta del archivo `trace.zip` generado. Las rutas de los adjuntos también aparecen en el reporte HTML.

Los reportes, logs y traces completos están excluidos de Git. Los artefactos de ejecución pueden contener datos de sesión; deben revisarse antes de compartirlos. Si SauceDemo no está disponible, conserva el reporte y documenta la indisponibilidad; no cambies las aserciones para ocultarla.

Se conserva en `evidence/` la [captura de confirmación](evidence/purchase-confirmation.png). Los reportes HTML/JUnit, logs y traces completos permanecen fuera de Git y se consultan en los artefactos de la ejecución correspondiente de Actions.

Para regenerar una evidencia detallada con la configuración de CI:

```bash
CI=true pnpm run test:regression --trace=on
```

Esto conserva traces también de las pruebas correctas de esa ejecución. Los traces pueden incluir los datos utilizados al iniciar sesión; se mantienen en los resultados locales o en artefactos con acceso controlado.

## GitHub Actions

El workflow `../.github/workflows/web.yml` instala la versión de pnpm declarada en `package.json`, prepara Node según `.nvmrc`, instala dependencias con `pnpm install --frozen-lockfile`, comprueba TypeScript y ejecuta Chromium. Los scripts de smoke y regresión incluyen la generación BDD antes de ejecutar las pruebas:

- **Pull request:** smoke cuando cambia Web o su workflow.
- **Push a main/master, después de merge:** regresión seleccionada.
- **Nightly:** regresión completa a las 08:00 UTC, equivalente a las 03:00 de Lima. GitHub puede iniciar el trabajo con retraso; el horario se activa al publicar el workflow en la rama predeterminada.
- **Manual:** escenarios del tag indicado en el campo `tag` de `workflow_dispatch`.

### Ejecución manual por tag

Con el workflow publicado en la rama predeterminada, abre **Actions → Web - Playwright → Run workflow**, elige la rama y completa el campo `tag`:

| Tag | Escenarios seleccionados |
| --- | --- |
| `@purchase` | Flujo de compra |
| `@login` | Cuatro escenarios de acceso |
| `@cart` | Eliminación y persistencia del carrito vacío |
| `@checkout` | Tres ejemplos de campos obligatorios |
| `@smoke` | Formulario, acceso válido y compra completa |
| `@regression` | Todos los escenarios actuales; es el valor predeterminado |

El campo acepta un único tag con `@`, letras, números, guiones o guiones bajos. Se compara el tag completo; por ejemplo, `@purchase` no selecciona un futuro tag `@purchase-negative`. Un tag sin escenarios hace fallar la ejecución en lugar de informar éxito sin ejecutar pruebas. Para añadir otra selección, etiqueta un feature o escenario y escribe ese mismo tag en la ejecución manual.

Configura los secrets de Actions `SAUCE_USERNAME` y `SAUCE_PASSWORD` en el repositorio. Sin ellos, el acceso positivo falla con el mensaje de configuración. GitHub no entrega estos secrets a pull requests de forks; esa ejecución requiere una estrategia adicional si se habilitan contribuciones externas.

Los reportes y evidencias disponibles se suben incluso si los tests fallan y se conservan durante siete días. Para la entrega, conserva el artefacto de la ejecución que corresponde al commit evaluado antes de que expire.

### Validación remota y publicación

La [regresión nocturna correcta](https://github.com/Ronaldoa1698/reto-ligo/actions/runs/44920750246) corresponde al commit `b162626c8c65ecaf7fe779447f67df4aded1ee18` e incluye las nueve ejecuciones. Actions vincula el resultado, el commit y sus artefactos. Los cambios posteriores requieren su propia ejecución para acreditar esa versión.

## Decisiones técnicas

- **BDD:** los escenarios mantienen ejemplos de negocio e IDs trazables. playwright-bdd permite conservar el runner, las fixtures y las evidencias de Playwright. El costo asumido es mantener los pasos y generar los tests; `bddgen` falla si falta una implementación.
- **POM y localizadores separados:** las acciones y verificaciones de una pantalla viven en su Page; el cambio de un selector se concentra en `locators/`. Los steps se mantienen centrados en el comportamiento y los datos.
- **Fixtures:** cada escenario solicita los recursos que necesita y recibe un contexto limpio. No se comparte una sesión autenticada global, un carrito ni una compra entre tests.
- **Datos:** el comprador es ficticio y cada escenario recibe una nueva copia. Precio e impuesto son referencias explícitas. El perfil bloqueado se identifica en el listado público de la demo; los valores de acceso permanecen en el entorno.
- **Confiabilidad:** localizadores específicos, esperas automáticas, aserciones que reintentan y concurrencia limitada. Ante un fallo se revisan trace, screenshot y logs para distinguir defecto de producto, fallo del test e indisponibilidad del servicio. Un reintento exitoso en CI sigue marcándose como flaky y falla la suite.
- **Escalabilidad:** añadir Pages y fixtures por capacidad, nuevos features y tags; aumentar workers o introducir sharding solo tras verificar aislamiento y capacidad del entorno. Extraer componentes compartidos cuando exista reutilización real.
- **V2:** compra de varios productos, más datos de checkout con reglas acordadas, navegadores adicionales, accesibilidad de los flujos críticos y seguimiento histórico de fallos intermitentes.
