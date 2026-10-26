package com.webaudit.frontEndBroadcaster.gcp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.webaudit.gcp.PubSubPublisher;

@Component
public class PubSubErrorPublisherImpl extends PubSubPublisher {
    @Value("${pubsub.error_topic}")
    private String topic;
    
    @Override
    protected String topic() {
        return this.topic;
    }
}