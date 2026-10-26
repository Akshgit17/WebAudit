package com.webaudit.models.dto;

import com.webaudit.models.ActionOLD;
import com.webaudit.models.Element;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer object that describes an object composed of both
 * {@link Element} and {@link ActionOLD}
 */
@Getter
@Setter
@NoArgsConstructor
public class ElementActionDto{

	private ElementStateDto element;
	private ActionDto action;

	/**
	 * Constructs an {@link ElementActionDto}
	 *
	 * @param elem the element
	 * @param action the action
	 *
	 * precondition: elem != null
	 * precondition: action != null
	 */
	public ElementActionDto(Element elem, ActionOLD action){
		assert elem != null;
		assert action != null;

		setElement(new ElementStateDto(elem));
		setAction(new ActionDto(action));
	}
}
