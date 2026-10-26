package com.webaudit.pageBuilder.gcp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PubSubJourneyVerifiedPublisherImpl extends com.webaudit.gcp.PubSubPublisher {

    @Value("${pubsub.journey_verified}")
    private String topic;
    
    @Override
    protected String topic() {
        return this.topic;
    }
}