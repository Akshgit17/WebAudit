package com.webaudit.models.dto;

import com.webaudit.models.ActionOLD;
import com.webaudit.models.Element;
import com.webaudit.models.WebAuditObject;
import com.webaudit.models.PageState;
import com.webaudit.models.Test;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data transfer object for {@link Test} object that is designed to comply with
 * the data format for browser extensions
 *
 * invariant: path != null after parameterized construction
 */
@Getter
@Setter
@NoArgsConstructor
public class TestDto {
	private String key;
	private String name;
	private List<Object> path;

	/**
	 * Constructor for {@link TestDto}
	 * @param test the {@link Test} to convert
	 *
	 * precondition: test != null
	 */
	public TestDto(Test test){
		assert test != null;

		setKey(test.getKey());
		setName(test.getName());

		this.path = new ArrayList<Object>();

		List<WebAuditObject> path_objects = test.getPathObjects();
		List<WebAuditObject> ordered_path_objects = new ArrayList<WebAuditObject>();
		//order by key
		for(String key : test.getPathKeys()){
			for(WebAuditObject obj : path_objects){
				if(obj.getKey().equals(key)){
					ordered_path_objects.add(obj);
				}
			}
		}

		boolean first_page = true;
		for(int idx = 0; idx < ordered_path_objects.size(); idx++){
			if(ordered_path_objects.get(idx) instanceof PageState && first_page){
				first_page = false;
				this.path.add(new PageStateDto((PageState)ordered_path_objects.get(idx)));
			}
			else if(ordered_path_objects.get(idx) instanceof Element ){
				this.path.add(new ElementActionDto((Element)ordered_path_objects.get(idx), (ActionOLD)ordered_path_objects.get(++idx)));
			}
		}
	}
}
