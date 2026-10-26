package com.crawlerApi.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Profile("local")
public class LocalSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // LOCAL-ONLY development security configuration.
        // Gated strictly on @Profile("local") so this configuration is NEVER loaded
        // in production or staging environments.
        // Installs an anonymous principal so HttpServletRequest.getUserPrincipal()
        // returns a non-null Principal whose getName() == "local-dev-user" with
        // default development roles and method authorizations.
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .anonymous(anon -> anon
                .principal("local-dev-user")
                .authorities("ROLE_USER", "read:actions"))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Permissive CORS for local dev only - the class is @Profile("local")
        // so this bean never exists outside the compose stack. Wildcard origin
        // is safe here because credentials are explicitly disabled below.
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
