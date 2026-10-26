package com.webaudit.models.audit.interfaces;

import com.webaudit.models.Domain;
import com.webaudit.models.audit.Audit;

/**
 * Interface for executable domain audits
 */
public interface IExecutableDomainAudit {
	/**
	 * Executes audit using list of {@link Audit audits}
	 * 
	 * @param domain {@link Domain} to audit
	 * 
 	 * @return {@link Audit audit} result of the audit
	 * 
	 * precondition: domain != null
	 */
	public Audit execute(Domain domain);
}
