# Reto QA Automation · Ligo

Automatización de pruebas Web, API y Mobile del reto técnico.

| Capa | Estado |
| --- | --- |
| [Web](web/README.md) | 9 pruebas: login, carrito, checkout y compra; diseño, trazabilidad y CI configurados |
| [API](api/README.md) | 7 pruebas: autenticación, ciclo de reservas, PATCH y autorización; diseño, trazabilidad y CI configurados |
| [Mobile](mobile/README.md) | 4 pruebas: compra, cantidades, eliminación y checkout; diseño, trazabilidad y CI configurados |

Para instalar y ejecutar las pruebas Web, sigue las instrucciones de [web/README.md](web/README.md).

Para preparar las variables de entorno y ejecutar las pruebas API, consulta [api/README.md](api/README.md).

Para preparar Android sin Android Studio y ejecutar Appium desde VS Code, consulta [mobile/README.md](mobile/README.md).

Las capturas seleccionadas se conservan en [Web](web/evidence/purchase-confirmation.png) y Mobile: [carrito](mobile/evidence/cart-before-checkout.png), [resumen](mobile/evidence/order-review.png) y [confirmación](mobile/evidence/purchase-confirmation.png).

El [reporte público Allure de Mobile](https://ronaldoa1698.github.io/reto-ligo/) permite revisar la última ejecución publicada y sus adjuntos sin instalar herramientas. Para una ejecución concreta, consulta el commit y los artefactos de [GitHub Actions](https://github.com/Ronaldoa1698/reto-ligo/actions).

La entrega contiene **16 casos automatizados que generan 20 ejecuciones de regresión**: Web, 7 casos / 9 ejecuciones; API, 5 / 7; Mobile, 4 / 4. Cada README documenta los riesgos, las técnicas aplicadas, las exclusiones y la matriz requerimiento → caso → fuente automatizada. Las filas no automatizadas no se cuentan como pruebas ejecutadas.

## Video de presentación

Queda pendiente grabar y añadir el enlace al video global de **10–15 minutos** solicitado por el reto. Las capturas y los videos de diagnóstico de fallos acompañan la ejecución; la presentación debe explicar las decisiones del candidato.

Guion sugerido:

1. Riesgos, prioridades y exclusiones de las tres capas (2 minutos).
2. Web: feature → steps → fixtures → Pages → locators; particiones y datos de checkout (3 minutos).
3. API: ciclo de reserva, GET de persistencia, autorización y ejemplos parametrizados (3 minutos).
4. Mobile: Pages, localizadores, reset por escenario y compra con las tres evidencias (3 minutos).
5. CI por evento, resultados asociados a un commit, confiabilidad y mejoras V2 (2 minutos).
