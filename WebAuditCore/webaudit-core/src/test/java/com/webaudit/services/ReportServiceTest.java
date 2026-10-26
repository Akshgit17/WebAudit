package com.webaudit.services;

import com.webaudit.models.audit.recommend.Recommendation;
import com.webaudit.models.dto.UXIssueReportDto;
import com.webaudit.models.enums.AuditCategory;
import com.webaudit.models.enums.ObservationType;
import com.webaudit.models.enums.Priority;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

public class ReportServiceTest {
	
	@Test
	public void testGenerateExcelReport() throws FileNotFoundException, IOException {
		//create list of messages
		List<UXIssueReportDto> messages = new ArrayList<>();
		Set<Recommendation> recommendations = new HashSet<>();

		UXIssueReportDto issue_dto = new UXIssueReportDto(recommendations.toString(),
														Priority.HIGH,
														"3 grammatical errors found",
														ObservationType.ELEMENT,
														AuditCategory.CONTENT,
														"meta title exceeds the recommended 70 character limit",
														new HashSet<>(),
														null,
														null,
														"",
														"");
		
		messages.add(issue_dto);
		
		UXIssueReportDto issue_dto1 = new UXIssueReportDto(recommendations.toString(),
				Priority.MEDIUM,
				"3 grammatical errors found",
				ObservationType.ELEMENT,
				AuditCategory.CONTENT,
				"meta title exceeds the recommended 70 character limit",
				new HashSet<>(),
				null,
				null,
				"",
			  	"");
		
		messages.add(issue_dto1);

		UXIssueReportDto issue_dto2 = new UXIssueReportDto(recommendations.toString(),
				Priority.MEDIUM,
				"3 grammatical errors found",
				ObservationType.ELEMENT,
				AuditCategory.INFORMATION_ARCHITECTURE,
				"meta title exceeds the recommended 70 character limit",
				new HashSet<>(),
				null,
				null,
				"",
			  	"");
		
		messages.add(issue_dto2);
		
		UXIssueReportDto issue_dto3 = new UXIssueReportDto(recommendations.toString(),
															Priority.MEDIUM,
															"3 grammatical errors found",
															ObservationType.ELEMENT,
															AuditCategory.AESTHETICS,
															"meta title exceeds the recommended 70 character limit",
															new HashSet<>(),
															null,
															null,
															"",
														  	"");
		
		messages.add(issue_dto3);
		
		
		URL url = new URL("https://www.WebAudit.com");
		XSSFWorkbook workbook = com.webaudit.services.ReportService.generateExcelSpreadsheet(messages, url);
        
        try (FileOutputStream outputStream = new FileOutputStream("JavaBooks.xlsx")) {
        	System.out.println("writing to output stream ... ");
            workbook.write(outputStream);
        }
		System.out.println("workbook ... "+workbook.getAllNames());
		System.out.println("workbook sheets... "+workbook.getNumberOfSheets());
		System.out.println("workbook sheets... "+workbook.getActiveSheetIndex());
		System.out.println("workbook sheets... "+workbook.getSpreadsheetVersion());

	}
}
