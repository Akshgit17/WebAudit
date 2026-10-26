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

public class CanvasAltTextAuditTest {

	private CanvasAltTextAudit audit;
	private AuditService auditService;
	private UXIssueMessageService issueMessageService;

	@Before
	public void setUp() throws Exception {
		audit = new CanvasAltTextAudit();
		auditService = mock(AuditService.class);
		issueMessageService = mock(UXIssueMessageService.class);

		Field auditServiceField = CanvasAltTextAudit.class.getDeclaredField("audit_service");
		auditServiceField.setAccessible(true);
		auditServiceField.set(audit, auditService);

		Field issueServiceField = CanvasAltTextAudit.class.getDeclaredField("issue_message_service");
		issueServiceField.setAccessible(true);
		issueServiceField.set(audit, issueMessageService);

		when(issueMessageService.save(any(UXIssueMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(auditService.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));
	}

	@Test
	public void executeWithNoVideoOrAudioElementsReturnsZeroScoreAudit() {
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
	public void executeWithVideoHavingTrackAndLinkScoresFullPoints() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState videoElement = mock(ElementState.class);
		when(videoElement.getName()).thenReturn("video");
		when(videoElement.getAllText()).thenReturn("<video><track src=\"captions.vtt\" kind=\"subtitles\"><a href=\"transcript.html\">Transcript</a></video>");
		when(videoElement.getId()).thenReturn(1L);
		elements.add(videoElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(2, result.getPoints());
		assertEquals(2, result.getTotalPossiblePoints());
	}

	@Test
	public void executeWithVideoMissingTrackScoresPartialPoints() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState videoElement = mock(ElementState.class);
		when(videoElement.getName()).thenReturn("video");
		when(videoElement.getAllText()).thenReturn("<video><a href=\"transcript.html\">Transcript</a></video>");
		when(videoElement.getId()).thenReturn(1L);
		elements.add(videoElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(1, result.getPoints());
		assertEquals(2, result.getTotalPossiblePoints());
	}

	@Test
	public void executeWithVideoMissingLinkScoresPartialPoints() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState videoElement = mock(ElementState.class);
		when(videoElement.getName()).thenReturn("video");
		when(videoElement.getAllText()).thenReturn("<video><track src=\"captions.vtt\" kind=\"subtitles\"></video>");
		when(videoElement.getId()).thenReturn(1L);
		elements.add(videoElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(1, result.getPoints());
		assertEquals(2, result.getTotalPossiblePoints());
	}

	@Test
	public void executeWithVideoMissingBothTrackAndLinkScoresZero() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState videoElement = mock(ElementState.class);
		when(videoElement.getName()).thenReturn("video");
		when(videoElement.getAllText()).thenReturn("<video><source src=\"movie.mp4\" type=\"video/mp4\"></video>");
		when(videoElement.getId()).thenReturn(1L);
		elements.add(videoElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(0, result.getPoints());
		assertEquals(2, result.getTotalPossiblePoints());
	}

	@Test
	public void executeFiltersVideoAndAudioElements() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState videoElement = mock(ElementState.class);
		when(videoElement.getName()).thenReturn("video");
		when(videoElement.getAllText()).thenReturn("<video><track src=\"captions.vtt\"><a href=\"t.html\">T</a></video>");
		when(videoElement.getId()).thenReturn(1L);
		elements.add(videoElement);

		ElementState audioElement = mock(ElementState.class);
		when(audioElement.getName()).thenReturn("audio");
		when(audioElement.getAllText()).thenReturn("<audio><track src=\"captions.vtt\"><a href=\"t.html\">T</a></audio>");
		when(audioElement.getId()).thenReturn(2L);
		elements.add(audioElement);

		ElementState divElement = mock(ElementState.class);
		when(divElement.getName()).thenReturn("div");
		elements.add(divElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertEquals(4, result.getPoints());
		assertEquals(4, result.getTotalPossiblePoints());
	}

	@Test
	public void executeWithVideoHavingTrackWithEmptySrcScoresZeroForTrack() {
		PageState pageState = mock(PageState.class);
		List<ElementState> elements = new ArrayList<>();

		ElementState videoElement = mock(ElementState.class);
		when(videoElement.getName()).thenReturn("video");
		when(videoElement.getAllText()).thenReturn("<video><track src=\"\"><a href=\"t.html\">Transcript</a></video>");
		when(videoElement.getId()).thenReturn(1L);
		elements.add(videoElement);

		when(pageState.getElements()).thenReturn(elements);
		when(pageState.getUrl()).thenReturn("http://example.com");

		Audit result = audit.execute(pageState, mock(AuditRecord.class), null);

		assertNotNull(result);
		assertEquals(1, result.getPoints());
		assertEquals(2, result.getTotalPossiblePoints());
	}
}
