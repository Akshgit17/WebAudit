package com.webaudit.models.dto;

import com.webaudit.models.TestUser;
import com.webaudit.models.designsystem.DesignSystem;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data transfer object for {@link DesignSystem} and {@link TestUser}s
 */
@Getter
@Setter
@NoArgsConstructor
public class DomainSettingsDto {
	private DesignSystem designSystem;
	private Set<TestUser> testUsers;
	
	/**
	 * Constructor
	 *
	 * @param designSystem the design system
	 * @param testUsers the test users
	 *
	 * precondition: designSystem != null
	 * precondition: testUsers != null
	 */
	public DomainSettingsDto(DesignSystem designSystem, Set<TestUser> testUsers) {
		assert designSystem != null;
		assert testUsers != null;

		this.setDesignSystem(designSystem);
		this.setTestUsers(testUsers);
	}
}
