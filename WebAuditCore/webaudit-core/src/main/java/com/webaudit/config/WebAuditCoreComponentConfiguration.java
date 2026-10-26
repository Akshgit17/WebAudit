package com.webaudit.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class responsible for component scanning of WebAuditCore services and components.
 * 
 * This configuration enables discovery and registration of all @Service, @Component, and other
 * Spring-managed beans in the WebAuditCore packages, making them available to consuming applications.
 */
@Configuration
@ComponentScan(basePackages = {
    "com.webaudit.designsystem",
    "com.webaudit.exceptions",
    "com.webaudit.models",
    "com.webaudit.models.domain",
    "com.webaudit.models.audit",
    "com.webaudit.models.audit.performance",
    "com.webaudit.models.audit.aesthetics",
    "com.webaudit.models.audit.content",
    "com.webaudit.models.audit.domain",
    "com.webaudit.models.audit.recommend",
    "com.webaudit.models.audit.informationarchitecture",
    "com.webaudit.models.competitiveanalysis",
    "com.webaudit.models.competitiveanalysis.brand",
    "com.webaudit.models.journeys",
    "com.webaudit.models.rules",
    "com.webaudit.services",
    "com.webaudit.gcp",
    "com.webaudit.integrations",
    "com.webaudit.browser",
    "com.webaudit.browsing.form",
    "com.webaudit.browsing.table",
    "com.webaudit.mapper",
    "com.webaudit.utils",
    "com.webaudit.vscodePlugin.structs",
    "com.webaudit.vscodePlugin.structs.dto"
})
public class WebAuditCoreComponentConfiguration {
    
    /**
     * This configuration class is responsible for scanning and registering
     * all WebAuditCore components as Spring beans.
     * 
     * The component scanning includes:
     * - Services (@Service)
     * - Components (@Component)  
     * - Model classes with Spring annotations
     * - Utility classes
     * - Integration services
     * - Browser automation components
     * - GCP services
     * - Mapper classes
     * - VSCode plugin structures
     * 
     * Note: Repository configuration is handled separately in WebAuditCoreRepositoryConfiguration
     * to maintain proper separation of concerns and avoid circular dependencies.
     */
} 