package com.webaudit.config;

import com.webaudit.browsing.client.BrowsingClient;
import com.webaudit.browsing.client.BrowsingClientConfig;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers {@link WebAuditBrowsingProperties} and, when
 * {@code WebAudit.browsing.mode=remote}, a {@link BrowsingClient} bean.
 *
 * <p>In local mode (the default) no {@code BrowsingClient} is instantiated —
 * consumers that don't opt in carry zero runtime overhead from this phase.
 *
 * <p>If a {@link MeterRegistry} bean is present in the application context,
 * the {@link BrowsingClient} instrumented with Micrometer timers; otherwise
 * instrumentation is a no-op. See {@link BrowsingClient} for the metric
 * contract.
 */
@Configuration
@EnableConfigurationProperties(WebAuditBrowsingProperties.class)
public class BrowsingClientConfiguration {

    @Bean
    @ConditionalOnProperty(name = "WebAudit.browsing.mode", havingValue = "remote")
    public BrowsingClient browsingClient(WebAuditBrowsingProperties props,
                                         ObjectProvider<MeterRegistry> meterRegistryProvider) {
        return new BrowsingClient(
            new BrowsingClientConfig(
                props.getServiceUrl(),
                props.getConnectTimeout(),
                props.getReadTimeout()),
            meterRegistryProvider.getIfAvailable());
    }
}
