package com.webaudit.models.repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import com.webaudit.models.audit.messages.ColorContrastIssueMessage;

/**
 * Repository interface for Spring Data Neo4j to handle interactions with 
 * {@link ColorContrastIssueMessage} objects
 */
@Repository
public interface ColorContrastIssueMessageRepository extends Neo4jRepository<ColorContrastIssueMessage, Long>  {
	
}
