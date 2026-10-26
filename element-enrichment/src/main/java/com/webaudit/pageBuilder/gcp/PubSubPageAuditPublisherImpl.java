package com.webaudit.pageBuilder.gcp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PubSubPageAuditPublisherImpl extends com.webaudit.gcp.PubSubPublisher {

    @SuppressWarnings("unused")
	private static Logger LOG = LoggerFactory.getLogger(PubSubPageAuditPublisherImpl.class);

    @Value("${pubsub.page_audit_topic}")
    private String topic;
    
    @Override
    protected String topic() {
        return this.topic;
    }
}