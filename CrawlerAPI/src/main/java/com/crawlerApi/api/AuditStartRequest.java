package com.crawlerApi.api;

import com.webaudit.models.enums.AuditLevel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request object for starting an audit
 */
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AuditStartRequest {

    private String url;
    private AuditLevel level;
}