package com.webaudit.visualDesignAudit.audit;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import com.webaudit.models.ElementState;
import com.webaudit.models.ImageElementState;
import com.webaudit.models.PageState;
import com.webaudit.models.audit.Audit;
import com.webaudit.models.audit.AuditRecord;
import com.webaudit.models.designsystem.DesignSystem;
import com.webaudit.models.enums.AuditCategory;
import com.webaudit.models.enums.AuditName;
import com.webaudit.models.enums.AuditSubcategory;
import com.webaudit.services.AuditService;
import com.webaudit.services.UXIssueMessageService;

@RunWith(MockitoJUnitRunner.class)
public class ImagePolicyAuditTest {

    @Mock
    private AuditService audit_service;

    @Mock
    private UXIssueMessageService issue_message_service;

    @InjectMocks
    private ImagePolicyAudit imagePolicyAudit;

    @Test
    public void testExecute_withNoElements() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        when(pageState.getElements()).thenReturn(new ArrayList<>());
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertNotNull(result);
        assertEquals(AuditCategory.CONTENT, result.getCategory());
        assertEquals(AuditSubcategory.IMAGERY, result.getSubcategory());
        assertEquals(AuditName.IMAGE_POLICY, result.getName());
    }

    @Test
    public void testExecute_returnsCorrectAuditMetadata() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        when(pageState.getElements()).thenReturn(new ArrayList<>());
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertEquals(AuditCategory.CONTENT, result.getCategory());
        assertEquals(AuditSubcategory.IMAGERY, result.getSubcategory());
        assertEquals(AuditName.IMAGE_POLICY, result.getName());
    }

    @Test
    public void testExecute_withNonImageElements() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        // Non-image elements should be filtered out
        ElementState textElement = mock(ElementState.class);
        when(textElement.getName()).thenReturn("p");
        when(pageState.getElements()).thenReturn(Arrays.asList(textElement));
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertNotNull(result);
        assertEquals(0, result.getPoints());
    }

    @Test
    public void testExecute_withCompliantImage() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        ImageElementState imgElement = mock(ImageElementState.class);
        when(imgElement.getName()).thenReturn("img");
        when(imgElement.isAdultContent()).thenReturn(false);
        when(imgElement.isViolentContent()).thenReturn(false);
        when(imgElement.getOwnedText()).thenReturn("");

        List<String> allowedChars = new ArrayList<>();
        when(designSystem.getAllowedImageCharacteristics()).thenReturn(allowedChars);

        List<ElementState> elements = new ArrayList<>();
        elements.add(imgElement);
        when(pageState.getElements()).thenReturn(elements);
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertNotNull(result);
    }

    @Test
    public void testExecute_withAdultContentImage_notAllowed() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        ImageElementState imgElement = mock(ImageElementState.class);
        when(imgElement.getName()).thenReturn("img");
        when(imgElement.isAdultContent()).thenReturn(true);
        when(imgElement.getOwnedText()).thenReturn("");

        List<String> allowedChars = new ArrayList<>();
        when(designSystem.getAllowedImageCharacteristics()).thenReturn(allowedChars);

        List<ElementState> elements = new ArrayList<>();
        elements.add(imgElement);
        when(pageState.getElements()).thenReturn(elements);
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertNotNull(result);
    }

    @Test
    public void testExecute_withAdultContentImage_allowed() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        ImageElementState imgElement = mock(ImageElementState.class);
        when(imgElement.getName()).thenReturn("img");
        when(imgElement.isAdultContent()).thenReturn(true);
        when(imgElement.isViolentContent()).thenReturn(false);
        when(imgElement.getOwnedText()).thenReturn("");

        List<String> allowedChars = new ArrayList<>(Arrays.asList("ADULT"));
        when(designSystem.getAllowedImageCharacteristics()).thenReturn(allowedChars);

        List<ElementState> elements = new ArrayList<>();
        elements.add(imgElement);
        when(pageState.getElements()).thenReturn(elements);
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertNotNull(result);
    }

    @Test
    public void testExecute_withViolentContentImage_notAllowed() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        ImageElementState imgElement = mock(ImageElementState.class);
        when(imgElement.getName()).thenReturn("img");
        when(imgElement.isAdultContent()).thenReturn(false);
        when(imgElement.isViolentContent()).thenReturn(true);
        when(imgElement.getOwnedText()).thenReturn("");

        List<String> allowedChars = new ArrayList<>();
        when(designSystem.getAllowedImageCharacteristics()).thenReturn(allowedChars);

        List<ElementState> elements = new ArrayList<>();
        elements.add(imgElement);
        when(pageState.getElements()).thenReturn(elements);
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertNotNull(result);
    }

    @Test
    public void testExecute_withViolentContentImage_allowed() {
        PageState pageState = mock(PageState.class);
        AuditRecord auditRecord = mock(AuditRecord.class);
        DesignSystem designSystem = mock(DesignSystem.class);

        ImageElementState imgElement = mock(ImageElementState.class);
        when(imgElement.getName()).thenReturn("img");
        when(imgElement.isAdultContent()).thenReturn(false);
        when(imgElement.isViolentContent()).thenReturn(true);
        when(imgElement.getOwnedText()).thenReturn("");

        List<String> allowedChars = new ArrayList<>(Arrays.asList("VIOLENCE"));
        when(designSystem.getAllowedImageCharacteristics()).thenReturn(allowedChars);

        List<ElementState> elements = new ArrayList<>();
        elements.add(imgElement);
        when(pageState.getElements()).thenReturn(elements);
        when(pageState.getUrl()).thenReturn("https://example.com");
        when(audit_service.save(any(Audit.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(issue_message_service.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Audit result = imagePolicyAudit.execute(pageState, auditRecord, designSystem);

        assertNotNull(result);
    }

    @Test
    public void testConstructor_default() {
        ImagePolicyAudit audit = new ImagePolicyAudit();
        assertNotNull(audit);
    }
}
