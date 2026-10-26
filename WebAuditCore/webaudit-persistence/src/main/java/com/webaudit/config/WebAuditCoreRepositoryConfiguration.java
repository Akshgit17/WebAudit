package com.webaudit.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

/**
 * Configuration class responsible for Neo4j repository configuration.
 * 
 * This configuration enables Neo4j repositories in the WebAuditCore library,
 * ensuring that all @Repository interfaces extending Neo4jRepository are
 * properly configured and available for dependency injection.
 */
@Configuration
@EnableNeo4jRepositories(
    basePackages = "com.webaudit.models.repository"
)
public class WebAuditCoreRepositoryConfiguration {
    
    /**
     * This configuration class is responsible for enabling and configuring
     * Neo4j repositories for the WebAuditCore library.
     * 
     * The configuration includes:
     * - Enabling Neo4j repository infrastructure
     * - Scanning for @Repository interfaces in com.webaudit.models.repository
     * - Providing proper transaction management for Neo4j operations
     * - Ensuring repository beans are available for dependency injection
     * 
     * This is separated from component scanning to maintain clean separation
     * of concerns and avoid potential circular dependencies during Spring
     * context initialization.
     */
} 