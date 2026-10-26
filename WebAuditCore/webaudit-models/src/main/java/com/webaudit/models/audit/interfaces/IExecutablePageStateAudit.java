package com.webaudit.models.audit.interfaces;

import com.webaudit.models.PageState;
import com.webaudit.models.audit.Audit;
import com.webaudit.models.audit.AuditRecord;
import com.webaudit.models.designsystem.DesignSystem;

/**
 * An interface for an executable page state audit
 */
public interface IExecutablePageStateAudit {
	/**
	 * Executes audit on {@link PageState page}
	 * 
	 * @param page_state the page state to audit
	 * @param audit_record the audit record to audit
	 * @param design_system the design system to audit
	 * @return the audit result
	 */
	public Audit execute(PageState page_state, AuditRecord audit_record, DesignSystem design_system);
}
