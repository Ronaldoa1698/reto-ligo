# Web · SauceDemo

Automatización con Playwright Test, TypeScript y playwright-bdd. Los escenarios usan palabras clave Gherkin en inglés (`Feature`, `Background`, `Scenario`, `Given`, `When`, `Then`, `And`) y descripciones en español. Cubren el acceso al catálogo; el carrito y el checkout se incorporarán después.

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

Las credenciales solo se requieren para `WEB-LOGIN-02`. Si faltan, ese test falla con un mensaje de configuración; no se omite silenciosamente. `.env` está excluido de Git y no debe reemplazarse por valores reales en `.env.example`.

## Ejecución

```bash
pnpm run typecheck
pnpm test
```

Los scripts de pruebas ejecutan `bddgen` antes de Playwright. Esta generación convierte los archivos `.feature` en tests dentro de `.features-gen/` y falla si un paso no tiene implementación. No es necesario ejecutar el generador por separado para correr la suite.

| Comando | Uso |
| --- | --- |
| `pnpm run bdd:generate` | Generar los tests y validar que todos los pasos estén definidos |
| `pnpm run test:smoke` | Formulario y acceso válido al catálogo |
| `pnpm run test:regression` | Todos los casos seleccionados actualmente |
| `pnpm run test:headed` | Ejecutar con el navegador visible |
| `pnpm run test:ui` | Abrir la interfaz de Playwright |
| `pnpm run test:debug` | Depurar con Playwright Inspector |
| `pnpm run test:list` | Enumerar casos sin abrir el navegador |
| `pnpm run report` | Abrir el último reporte HTML |

Para filtrar un escenario por su ID, ejecuta `pnpm test --grep WEB-LOGIN-02`. En modo UI, si editas un archivo `.feature`, ejecuta `pnpm run bdd:generate` desde otra terminal para actualizar los tests disponibles. También puedes cerrar y volver a abrir `pnpm run test:ui`.

Para comprobar el formulario y el rechazo de acceso sin configurar credenciales:

```bash
pnpm test --grep 'WEB-LOGIN-01|WEB-LOGIN-03'
```

En Linux/CI, instala también las dependencias del sistema del navegador con `pnpm exec playwright install --with-deps chromium`.

## Casos iniciales y trazabilidad

Los casos se especifican en `src/resources/feature/login.feature` y sus pasos se implementan en `src/playwright/steps/login.steps.ts`. P0 corresponde a acceso crítico al flujo de compra; P1 cubre validaciones adicionales. Se conservan los IDs en los nombres de escenario para relacionarlos con los resultados del reporte.

| ID | Flujo / resultado esperado | Prioridad | Técnica | Suite |
| --- | --- | --- | --- | --- |
| WEB-LOGIN-01 | Login: se muestran los campos y el botón de acceso | P1 | Comprobación de disponibilidad de la interfaz | Smoke / Regression |
| WEB-LOGIN-02 | Login → catálogo: un usuario válido ve productos | P0 | Partición de equivalencia: credenciales válidas | Smoke / Regression |
| WEB-LOGIN-03 | Login: credenciales inválidas muestran el error y mantienen al usuario fuera del catálogo | P1 | Partición de equivalencia: credenciales inválidas | Regression |

La selección verifica la entrada al flujo principal y una partición negativa. Esta etapa no cubre todavía compra completa, usuarios especiales, carrito, checkout ni otros navegadores.

## Arquitectura y configuración

```text
web/
├── src/
│   ├── playwright/
│   │   ├── fixtures/test.ts           # Pages, credenciales y enlace con BDD
│   │   ├── locators/
│   │   │   ├── login.locators.ts      # Elementos de la pantalla de acceso
│   │   │   └── inventory.locators.ts  # Elementos del catálogo
│   │   ├── pages/
│   │   │   ├── login.page.ts          # Acciones de acceso
│   │   │   └── inventory.page.ts      # Page Object del catálogo
│   │   └── steps/login.steps.ts       # Implementación de Given / When / Then
│   └── resources/
│       └── feature/login.feature      # Escenarios Gherkin e IDs de caso
├── .features-gen/                     # Tests generados; no se editan manualmente
├── playwright.config.ts               # Configuración BDD y del runner de Playwright
├── tsconfig.json                      # Comprobación estricta de tipos
└── .env.example                       # Variables sin credenciales reales
```

La estructura combina Gherkin, Page Object Model y fixtures. Los `.feature` describen el comportamiento esperado; los steps coordinan llamadas a métodos de los Page Objects y reciben datos mediante fixtures. Los Pages implementan las interacciones y verificaciones de cada pantalla con las aserciones de Playwright. Las clases de `src/playwright/locators/` contienen las definiciones de localizadores y cada Page Object mantiene su instancia en una propiedad `private readonly locators`. Los steps no acceden directamente a localizadores ni al objeto `page`. Los escenarios se ejecutan con el runner de Playwright mediante [playwright-bdd](https://vitalets.github.io/playwright-bdd/).

El texto «Como / Quiero / Para» bajo `Feature` describe quién usa la funcionalidad, qué necesita y con qué objetivo. Es documentación opcional y no se ejecuta. El `Background`, colocado antes del primer escenario, sí se ejecuta antes de cada escenario del feature.

`src/playwright/fixtures/test.ts` extiende el `test` base de playwright-bdd mediante `base.extend()`. Proporciona `LoginPage`, `InventoryPage` y las credenciales del entorno cuando los pasos los necesitan. Los Page Objects usan la misma `page` dentro de un escenario. `use(valor)` entrega el recurso al escenario; `createBdd(test)` conecta esa instancia de test con `Given`, `When` y `Then`. La fixture `page` sigue siendo administrada por Playwright y cada escenario recibe un contexto de navegador limpio.

Los archivos `*.spec.js` de `.features-gen/` se regeneran antes de ejecutar y están excluidos de Git. La fuente que mantenemos está dentro de `src/`: features, steps, Page Objects, localizadores y fixtures. `@regression` se hereda desde la característica y `@smoke` identifica los dos escenarios de la suite rápida.

Para incorporar otra pantalla, añade sus localizadores en `src/playwright/locators/`, el Page Object en `src/playwright/pages/` y su fixture si los pasos necesitan recibirlo. Los nuevos pasos van en `src/playwright/steps/` y los escenarios en archivos con extensión `.feature` dentro de `src/resources/feature/`. La configuración descubre los nuevos archivos por esos patrones.

Los localizadores usan roles o `data-test`, configurado como atributo de test ID de SauceDemo. Las esperas son las propias de Playwright y de sus aserciones; no se usan pausas fijas.

Solo se configura Chromium en esta etapa. Se permiten dos workers locales y uno en CI para limitar concurrencia contra el sitio público. No hay reintentos locales; CI permite uno para obtener diagnóstico. `failOnFlakyTests` hace fallar la ejecución si un caso solo pasa tras reintentar. TypeScript se comprueba por separado porque la ejecución de Playwright no reemplaza el chequeo de tipos.

## Reportes y evidencias

Después de ejecutar:

- `playwright-report/index.html`: reporte HTML.
- `reports/junit.xml`: resultados JUnit para CI.
- `test-results/`: screenshots, trace y video de las pruebas fallidas.

Los tests correctos no conservan trace ni video. Para inspeccionar un trace fallido, ejecuta `pnpm exec playwright show-trace` seguido de la ruta del archivo `trace.zip` generado. Las rutas de los adjuntos también aparecen en el reporte HTML.

Los resultados y las evidencias están excluidos de Git. Los artefactos de ejecución pueden contener datos de sesión; deben revisarse antes de compartirlos. Si SauceDemo no está disponible, conserva el reporte y documenta la indisponibilidad; no cambies las aserciones para ocultarla.

## GitHub Actions

El workflow `../.github/workflows/web.yml` instala la versión de pnpm declarada en `package.json`, prepara Node según `.nvmrc`, instala dependencias con `pnpm install --frozen-lockfile`, comprueba TypeScript y ejecuta Chromium. Los scripts de smoke y regresión incluyen la generación BDD antes de ejecutar las pruebas:

- **Pull request:** smoke cuando cambia Web o su workflow.
- **Push a main/master, después de merge:** regresión seleccionada.
- **Nightly:** regresión a las 08:00 UTC, equivalente a las 03:00 de Lima.
- **Manual:** regresión mediante `workflow_dispatch`.

Configura los secrets de Actions `SAUCE_USERNAME` y `SAUCE_PASSWORD` en el repositorio. Sin ellos, el acceso positivo falla con el mensaje de configuración. GitHub no entrega estos secrets a pull requests de forks; esa ejecución requiere una estrategia adicional si se habilitan contribuciones externas.

Los reportes y evidencias disponibles se suben incluso si los tests fallan y se conservan durante siete días. El workflow queda preparado en código; su ejecución remota requiere subir el repositorio y configurar los secrets.
