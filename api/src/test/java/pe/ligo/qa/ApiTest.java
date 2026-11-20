package pe.ligo.qa;

import io.karatelabs.core.Runner;
import io.karatelabs.core.SuiteResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiTest {

    @Test
    void runApiScenarios() {
        String tag = System.getProperty("api.tags", "@regression");
        if (!tag.matches("@[A-Za-z0-9_-]+")) {
            throw new IllegalArgumentException("api.tags debe contener un único tag, por ejemplo @booking.");
        }
        int threads = Integer.parseInt(System.getProperty("api.threads", "1"));
        if (threads < 1) {
            throw new IllegalArgumentException("api.threads debe ser mayor o igual a 1.");
        }

        SuiteResult result = Runner.path("classpath:features")
                .tags(tag)
                .outputDir("target/karate-reports")
                .outputHtmlReport(true)
                .outputJunitXml(true)
                .parallel(threads);

        assertTrue(result.getScenarioCount() > 0,
                "No se encontraron escenarios para el tag " + tag);
        assertTrue(result.isPassed(),
                "Hay escenarios API fallidos. Revisa target/karate-reports/karate-summary.html");
    }
}
