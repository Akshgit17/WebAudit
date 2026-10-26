package com.webaudit.contentAudit.models;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.webaudit.models.ElementState;
import com.webaudit.models.PageState;
import com.webaudit.models.audit.Audit;
import com.webaudit.models.audit.AuditRecord;
import com.webaudit.models.audit.messages.UXIssueMessage;
import com.webaudit.models.enums.AuditCategory;
import com.webaudit.models.enums.AuditName;
import com.webaudit.models.enums.AuditSubcategory;
import com.webaudit.services.AuditService;
import com.webaudit.services.UXIssueMessageService;

public class AppletAltTextAuditTest {

	private AppletAltTextAudit audit;
	private AuditService auditService;
	private UXIssueMessageService issueMessageService;

	@Before
	public void setUp() throws Exception {
		audit = new AppletAltTextAudit();
		auditService = mock(AuditService.class);
		issueMessageService = mock(UXIssueMessageService.class);

		Field auditServiceField = AppletAltTextAudit.class.getDeclaredField("audit_service");
		auditServiceField.setAccessible(true);
		auditServiceField.set(audit, auditService);

		Field issueServiceField = AppletAltTextAudit.class.getDeclaredField("issue_message_service");
		issueServiceField.setAccessible(true);
		issueServiceField.set(audit, issueMessageService);

		when(issueMessageService.save(any(UXIssueMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(auditService.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));
	}

	@Test
	public void executeWithNoAppletElementsReturnsZeroScoreAudit() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();
		ElementState divElement = mock(ElementState.class);
		when(divElement.getName()).thenReturn("div");
		elements.add(divElement);
		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(AuditCategory.CONTENT, result.getCategory());
		assertEquals(AuditSubcategory.IMAGERY, result.getSubcategory());
		assertEquals(AuditName.ALT_TEXT, result.getName());
		assertEquals(0, result.getPoints());
		assertEquals(0, result.getTotalPossiblePoints());
	}

	@Test
	public void executeWithAppletHavingAltTagScoresFullPoints() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState appletElement = mock(ElementState.class);
		when(appletElement.getName()).thenReturn("applet");
		when(appletElement.getAllText()).thenReturn("<applet><alt>Alternative text for applet</alt></applet>");
		when(appletElement.getId()).thenReturn(1L);
		elements.add(appletElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(1, result.getPoints());
		assertEquals(1, result.getTotalPossiblePoints());
	}

	@Test
	public void executeWithAppletMissingAltTagScoresZero() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState appletElement = mock(ElementState.class);
		when(appletElement.getName()).thenReturn("applet");
		when(appletElement.getAllText()).thenReturn("<applet code=\"MyApplet.class\"></applet>");
		when(appletElement.getId()).thenReturn(1L);
		elements.add(appletElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(0, result.getPoints());
		assertEquals(1, result.getTotalPossiblePoints());
	}

	@Test
	public void executeFiltersOnlyAppletElements() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState appletElement = mock(ElementState.class);
		when(appletElement.getName()).thenReturn("applet");
		when(appletElement.getAllText()).thenReturn("<applet><alt>Alt text</alt></applet>");
		when(appletElement.getId()).thenReturn(1L);
		elements.add(appletElement);

		ElementState divElement = mock(ElementState.class);
		when(divElement.getName()).thenReturn("div");
		elements.add(divElement);

		ElementState imgElement = mock(ElementState.class);
		when(imgElement.getName()).thenReturn("img");
		elements.add(imgElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertEquals(1, result.getPoints());
		assertEquals(1, result.getTotalPossiblePoints());
	}
}
