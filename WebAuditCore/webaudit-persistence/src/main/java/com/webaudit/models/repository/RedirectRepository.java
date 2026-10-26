package com.webaudit.models.repository;

import com.webaudit.models.journeys.Redirect;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for {@link Redirect} objects
 */
@Repository
public interface RedirectRepository extends Neo4jRepository<Redirect, Long> {
	/**
	 * Finds a redirect by its key
	 * @param key the key of the redirect
	 * @return the redirect
	 */
	public Redirect findByKey(@Param("key") String key);
}
