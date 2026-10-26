package com.webaudit.visualDesignAudit.audit;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import com.webaudit.models.ImageElementState;
import com.webaudit.models.PageState;
import com.webaudit.models.audit.Audit;
import com.webaudit.models.audit.AuditRecord;
import com.webaudit.models.audit.Score;
import com.webaudit.models.designsystem.DesignSystem;
import com.webaudit.models.enums.AuditCategory;
import com.webaudit.models.enums.AuditName;
import com.webaudit.models.enums.AuditSubcategory;
import com.webaudit.services.AuditService;
import com.webaudit.services.UXIssueMessageService;

@RunWith(MockitoJUnitRunner.class)
public class ImageAuditTest {

    @Mock
    private AuditService audit_service;

    @Mock
    private UXIssueMessageService issue_message_service;

    @InjectMocks
    private ImageAudit imageAudit;

    // ========== calculateCopyrightScore tests ==========

    @Test
    public void testCalculateCopyrightScore_emptyList() {
        List<ImageElementState> elements = new ArrayList<>();
        Score result = imageAudit.calculateCopyrightScore(elements);

        assertNotNull(result);
        assertEquals(0, result.getPointsAchieved());
        assertEquals(0, result.getMaxPossiblePoints());
        assertTrue(result.getIssueMessages().isEmpty());
    }

    @Test
    public void testCalculateCopyrightScore_allFlagged() {
        List<ImageElementState> elements = new ArrayList<>();

        ImageElementState flaggedImage1 = mock(ImageElementState.class);
        when(flaggedImage1.isImageFlagged()).thenReturn(true);
        elements.add(flaggedImage1);

        ImageElementState flaggedImage2 = mock(ImageElementState.class);
        when(flaggedImage2.isImageFlagged()).thenReturn(true);
        elements.add(flaggedImage2);

        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Score result = imageAudit.calculateCopyrightScore(elements);

        assertNotNull(result);
        assertEquals(0, result.getPointsAchieved());
        assertEquals(2, result.getMaxPossiblePoints());
        assertEquals(2, result.getIssueMessages().size());
    }

    @Test
    public void testCalculateCopyrightScore_allUnique() {
        List<ImageElementState> elements = new ArrayList<>();

        ImageElementState uniqueImage1 = mock(ImageElementState.class);
        when(uniqueImage1.isImageFlagged()).thenReturn(false);
        elements.add(uniqueImage1);

        ImageElementState uniqueImage2 = mock(ImageElementState.class);
        when(uniqueImage2.isImageFlagged()).thenReturn(false);
        elements.add(uniqueImage2);

        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Score result = imageAudit.calculateCopyrightScore(elements);

        assertNotNull(result);
        assertEquals(2, result.getPointsAchieved());
        assertEquals(2, result.getMaxPossiblePoints());
    }

    @Test
    public void testCalculateCopyrightScore_mixed() {
        List<ImageElementState> elements = new ArrayList<>();

        ImageElementState flaggedImage = mock(ImageElementState.class);
        when(flaggedImage.isImageFlagged()).thenReturn(true);
        elements.add(flaggedImage);

        ImageElementState uniqueImage = mock(ImageElementState.class);
        when(uniqueImage.isImageFlagged()).thenReturn(false);
        elements.add(uniqueImage);

        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Score result = imageAudit.calculateCopyrightScore(elements);

        assertNotNull(result);
        assertEquals(1, result.getPointsAchieved());
        assertEquals(2, result.getMaxPossiblePoints());
    }

    @Test
    public void testCalculateCopyrightScore_singleFlagged() {
        List<ImageElementState> elements = new ArrayList<>();

        ImageElementState flaggedImage = mock(ImageElementState.class);
        when(flaggedImage.isImageFlagged()).thenReturn(true);
        elements.add(flaggedImage);

        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Score result = imageAudit.calculateCopyrightScore(elements);

        assertEquals(0, result.getPointsAchieved());
        assertEquals(1, result.getMaxPossiblePoints());
    }

    @Test
    public void testCalculateCopyrightScore_singleUnique() {
        List<ImageElementState> elements = new ArrayList<>();

        ImageElementState uniqueImage = mock(ImageElementState.class);
        when(uniqueImage.isImageFlagged()).thenReturn(false);
        elements.add(uniqueImage);

        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Score result = imageAudit.calculateCopyrightScore(elements);

        assertEquals(1, result.getPointsAchieved());
        assertEquals(1, result.getMaxPossiblePoints());
    }

    @Test
    public void testCalculateCopyrightScore_pointsNeverExceedMax() {
        List<ImageElementState> elements = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            ImageElementState img = mock(ImageElementState.class);
            when(img.isImageFlagged()).thenReturn(i % 3 == 0);
            elements.add(img);
        }

        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Score result = imageAudit.calculateCopyrightScore(elements);

        assertTrue(result.getPointsAchieved() <= result.getMaxPossiblePoints());
        assertEquals(10, result.getMaxPossiblePoints());
    }

    // ========== execute tests ==========

    @Test
    public void testExecute_withNoImageElements() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);

        when(pageState.getElements()).thenReturn(new ArrayList<>());
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imageAudit.execute(pageState, auditRecord, null);

        assertNotNull(result);
        assertEquals(AuditCategory.CONTENT, result.getCategory());
        assertEquals(AuditSubcategory.IMAGERY, result.getSubcategory());
        assertEquals(AuditName.IMAGE_COPYRIGHT, result.getName());
    }

    @Test
    public void testExecute_returnsCorrectAuditMetadata() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);

        when(pageState.getElements()).thenReturn(new ArrayList<>());
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imageAudit.execute(pageState, auditRecord, null);

        assertEquals(AuditCategory.CONTENT, result.getCategory());
        assertEquals(AuditSubcategory.IMAGERY, result.getSubcategory());
        assertEquals(AuditName.IMAGE_COPYRIGHT, result.getName());
        assertNotNull(result.getWhyItMatters());
    }

    @Test
    public void testConstructor_default() {
        ImageAudit audit = new ImageAudit();
        assertNotNull(audit);
    }
}
