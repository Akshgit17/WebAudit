package com.webaudit.auditManager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

/**
 * Entry point for the Audit Manager Spring Boot microservice.
 *
 * <p>Bootstraps the application context, scanning only the
 * {@code com.webaudit.auditManager} package for components while pulling
 * entity and repository definitions from the WebAuditCore library.
 *
 * <p>The auto-configuration class {@link com.webaudit.WebAuditCoreAutoConfiguration}
 * is explicitly excluded to avoid a circular-import issue; the beans it would
 * create are instead defined in
 * {@link com.webaudit.auditManager.config.PubSubConfig}.
 *
 * @see com.webaudit.auditManager.config.PubSubConfig
 */
@SpringBootApplication(exclude = {
    com.webaudit.config.WebAuditCoreAutoConfiguration.class
})
@ComponentScan(basePackages = {"com.webaudit.auditManager"})
@PropertySources({
	@PropertySource("classpath:application.properties")
})
@EnableNeo4jRepositories(basePackages = {
    "com.webaudit.models.repository"
})
@EntityScan(basePackages = {
    "com.webaudit.models",
	"com.webaudit.gcp"
})
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
