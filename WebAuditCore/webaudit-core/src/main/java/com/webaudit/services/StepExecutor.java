package com.webaudit.services;

import com.webaudit.browser.Browser;
import com.webaudit.models.ElementState;
import com.webaudit.models.PageState;
import com.webaudit.models.enums.Action;
import com.webaudit.models.journeys.LandingStep;
import com.webaudit.models.journeys.LoginStep;
import com.webaudit.models.journeys.SimpleStep;
import com.webaudit.models.journeys.Step;
import com.webaudit.utils.BrowserUtils;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Executes a step
 */
@Service
public class StepExecutor {
	@SuppressWarnings("unused")
	private static Logger log = LoggerFactory.getLogger(StepExecutor.class);
	
	/**
	 * Executes a step
	 *
	 * @param browser the {@link Browser} to execute the step on
	 * @param step the {@link Step} to execute
	 *
	 * @throws Exception if an error occurs
	 */
	public void execute(Browser browser, Step step) throws Exception {
		assert browser != null;
		assert step != null;

		try {
			if(step instanceof SimpleStep) {
				SimpleStep simple_step = (SimpleStep)step;
				ElementState element = simple_step.getElementState();
				WebElement web_element = browser.findElement(element.getXpath());
				browser.scrollToElementCentered(web_element);
				browser.performClick(web_element);
			}
			else if(step instanceof LoginStep) {
				LoginStep login_step = (LoginStep)step;
				WebElement username_element = browser.findElement(login_step.getUsernameElement().getXpath());
				browser.performAction(username_element, com.webaudit.browser.enums.Action.SEND_KEYS, login_step.getTestUser().getUsername());

				WebElement password_element = browser.findElement(login_step.getPasswordElement().getXpath());
				browser.performAction(password_element, com.webaudit.browser.enums.Action.SEND_KEYS, login_step.getTestUser().getPassword());

				WebElement submit_element = browser.findElement(login_step.getSubmitElement().getXpath());
				browser.performAction(submit_element, com.webaudit.browser.enums.Action.CLICK, "");
			}
			else if(step instanceof LandingStep) {
				PageState initial_page = step.getStartPage();
				String sanitized_url = BrowserUtils.sanitizeUrl(initial_page.getUrl(), initial_page.isSecured());
				browser.navigateTo(sanitized_url);
			}
			else {
				log.warn("Unknown step type during execution = " + step.getKey());
			}
		}
		catch(MoveTargetOutOfBoundsException e) {
			browser.getViewportScrollOffset();
			log.warn("MOVE TO TARGET EXCEPTION FOR ELEMENT = "+e.getMessage());
			log.warn("============================================================");;
			log.warn("URL = "+browser.getCurrentUrl());
			log.warn("browser dimension = "+browser.getViewportSize());
			log.warn("browser offset = "+browser.getXScrollOffset()+" , "+browser.getYScrollOffset());
			log.warn("============================================================");;
			throw e;
		}
		catch(Exception e){
			log.warn("error occurred while performing steps...."+e.getMessage());
			throw e;
		}
	}
}
