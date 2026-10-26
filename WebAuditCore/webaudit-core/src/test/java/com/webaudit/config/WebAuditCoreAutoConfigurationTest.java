package com.webaudit.config;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ActiveProfiles;

import com.webaudit.config.WebAuditCoreProperties;
import com.webaudit.config.PusherProperties;
import com.webaudit.gcp.GoogleCloudStorageProperties;

/**
 * Test class to verify that WebAuditCore configuration properties 
 * bind correctly without requiring full application context.
 */
@ActiveProfiles("test")
class WebAuditCoreAutoConfigurationTest {

    @Configuration
    @EnableConfigurationProperties({
        WebAuditCoreProperties.class, 
        PusherProperties.class, 
        GoogleCloudStorageProperties.class
    })
    static class TestConfiguration {
        // Minimal configuration for testing properties only
    }

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(TestConfiguration.class)
            .withPropertyValues("spring.profiles.active=test");

    @Test
    void shouldBindWebAuditCoreProperties() {
        contextRunner
            .withPropertyValues(
                "WebAudit.core.enabled=true",
                "WebAudit.core.neo4j.connection-timeout=5000",
                "WebAudit.core.neo4j.max-connection-pool-size=100"
            )
            .run(context -> {
                assertThat(context).hasSingleBean(WebAuditCoreProperties.class);
                
                WebAuditCoreProperties properties = context.getBean(WebAuditCoreProperties.class);
                assertThat(properties.isEnabled()).isTrue();
                assertThat(properties.getNeo4j().getConnectionTimeout()).isEqualTo(5000);
                assertThat(properties.getNeo4j().getMaxConnectionPoolSize()).isEqualTo(100);
            });
    }

    @Test
    void shouldBindPusherProperties() {
        contextRunner
            .withPropertyValues(
                "pusher.appId=test-app-id",
                "pusher.key=test-key",
                "pusher.secret=test-secret",
                "pusher.cluster=test-cluster",
                "pusher.encrypted=false"
            )
            .run(context -> {
                assertThat(context).hasSingleBean(PusherProperties.class);
                
                PusherProperties properties = context.getBean(PusherProperties.class);
                assertThat(properties.getAppId()).isEqualTo("test-app-id");
                assertThat(properties.getKey()).isEqualTo("test-key");
                assertThat(properties.getSecret()).isEqualTo("test-secret");
                assertThat(properties.getCluster()).isEqualTo("test-cluster");
                assertThat(properties.isEncrypted()).isFalse();
            });
    }

    @Test
    void shouldBindGoogleCloudStorageProperties() {
        contextRunner
            .withPropertyValues(
                "gcs.bucket.bucketName=test-bucket",
                "gcs.bucket.publicUrl=https://storage.googleapis.com/test-bucket"
            )
            .run(context -> {
                assertThat(context).hasSingleBean(GoogleCloudStorageProperties.class);
                
                GoogleCloudStorageProperties properties = context.getBean(GoogleCloudStorageProperties.class);
                assertThat(properties.getBucketName()).isEqualTo("test-bucket");
                assertThat(properties.getPublicUrl()).isEqualTo("https://storage.googleapis.com/test-bucket");
            });
    }

    @Test
    void shouldHaveDefaultValues() {
        contextRunner.run(context -> {
            WebAuditCoreProperties properties = context.getBean(WebAuditCoreProperties.class);
            
            // Verify default values work
            assertThat(properties.isEnabled()).isTrue();
            assertThat(properties.getNeo4j().getConnectionTimeout()).isEqualTo(30000);
            assertThat(properties.getNeo4j().getMaxConnectionPoolSize()).isEqualTo(50);
            assertThat(properties.getNeo4j().isConnectionPoolingEnabled()).isTrue();
        });
    }
}