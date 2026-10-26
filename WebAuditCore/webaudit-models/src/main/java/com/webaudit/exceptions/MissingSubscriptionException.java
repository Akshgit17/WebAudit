package com.webaudit.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user is missing a subscription
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class MissingSubscriptionException extends RuntimeException {
	/**
	 * 
	 */
	private static final long serialVersionUID = 7200878662560716216L;

	/**
	 * Default constructor for {@link MissingSubscriptionException}
	 */
	public MissingSubscriptionException() {
		super("Welcome to WebAudit! Sign up for a plan to get started.");
	}
}
