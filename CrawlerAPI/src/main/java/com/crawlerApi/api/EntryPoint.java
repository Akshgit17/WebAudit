package com.crawlerApi.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.freemarker.FreeMarkerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

import com.crawlerApi.config.Auth0Config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;

/**
 * Initializes the system and launches it.
 *
 */

@SpringBootApplication(exclude={SecurityAutoConfiguration.class })
@ComponentScan(basePackages = {"com.crawlerApi*", "com.webaudit*"})
@org.springframework.context.annotation.Import({com.webaudit.config.WebAuditCoreAutoConfiguration.class})
@PropertySources({
	@PropertySource("classpath:application.properties"),
	@PropertySource("classpath:auth0.properties")
})
@EnableAutoConfiguration(exclude = { FreeMarkerAutoConfiguration.class })
@EnableConfigurationProperties(Auth0Config.class)
//@ConfigurationProperties("spring.cloud.gcp.vision")
@EntityScan(basePackages = { "com.crawlerApi.models"} )
@OpenAPIDefinition(
    info = @Info(
        title = "WebAudit Crawler API",
        version = "1.0.0",
        description = "API for WebAudit web crawling and auditing functionality",
        contact = @Contact(
            name = "WebAudit API Support",
            email = "support@webaudit.io"
        ),
        license = @License(
            name = "WebAudit",
            url = ""
        )
    ),
    servers = {
        @Server(url = "https://api.webaudit.io/v1", description = "Production Server"),
        @Server(url = "https://staging-api.webaudit.io/v1", description = "Staging Server"),
        @Server(url = "http://localhost:9080/v1", description = "Local Development")
    }
)
public class EntryPoint {
	
	public static void main(String[] args){
        SpringApplication.run(EntryPoint.class, args);
   	}
}


