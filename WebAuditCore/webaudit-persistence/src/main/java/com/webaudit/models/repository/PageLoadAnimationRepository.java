package com.webaudit.models.repository;

import com.webaudit.models.PageLoadAnimation;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;

/**
 * Repository for page load animations
 */
public interface PageLoadAnimationRepository extends Neo4jRepository<PageLoadAnimation, Long> {
	/**
	 * Find a page load animation by key
	 * @param key the key of the page load animation
	 * @return the page load animation
	 */
	public PageLoadAnimation findByKey(@Param("key") String key);
}
