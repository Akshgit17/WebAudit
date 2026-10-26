package com.webaudit.models.repository;

import com.webaudit.models.form.FormField;
import org.springframework.data.neo4j.repository.Neo4jRepository;

/**
 * Repository for {@link FormField}s
 */
public interface FormFieldRepository extends Neo4jRepository<FormField, Long> {

}
