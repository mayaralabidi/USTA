package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI maintenanceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Maintenance Management API")
                        .description("API REST pour la gestion des opérations de maintenance industrielle")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Équipe Maintenance")
                                .email("maintenance@demo.com")));
    }
}