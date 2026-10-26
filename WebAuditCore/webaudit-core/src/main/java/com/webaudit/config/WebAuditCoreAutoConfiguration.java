package com.webaudit.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import com.webaudit.gcp.GoogleCloudStorageProperties;

/**
 * Main auto-configuration class for WebAuditCore library.
 * 
 * This configuration serves as the entry point for WebAuditCore auto-configuration
 * and imports focused configuration classes to avoid circular dependencies.
 * 
 * This auto-configuration will be automatically loaded by Spring Boot when this
 * library is included as a dependency in other Spring Boot applications.
 */
@Configuration
@EnableConfigurationProperties({WebAuditCoreProperties.class, GoogleCloudStorageProperties.class, PusherProperties.class})
@ConditionalOnProperty(prefix = "WebAudit.core", name = "enabled", havingValue = "true", matchIfMissing = true)
@Import({
    WebAuditCoreComponentConfiguration.class,
    WebAuditCoreRepositoryConfiguration.class,
    WebAuditCoreBrowserBeansConfiguration.class,
    PusherConfiguration.class,
    SeleniumConfiguration.class,
    BrowserStackConfiguration.class,
    BrowsingClientConfiguration.class
})
public class WebAuditCoreAutoConfiguration {
    
    /**
     * This class serves as the main entry point for WebAuditCore auto-configuration.
     * 
     * The configuration is split into focused components:
     * 1. WebAuditCoreComponentConfiguration - handles component scanning
     * 2. WebAuditCoreRepositoryConfiguration - handles Neo4j repository configuration
     * 3. PusherConfiguration - handles Pusher client configuration
     * 4. SeleniumConfiguration - handles Selenium WebDriver configuration (optional)
     * 
     * This approach prevents circular dependencies and provides better separation of concerns.
     * 
     * The configuration can be disabled by setting WebAudit.core.enabled=false
     * in the consuming application's configuration.
     */
} 