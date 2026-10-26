package com.webaudit.mapper;

import java.util.HashMap;
import java.util.Map;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Body is the payload of a Pub/Sub event. Please refer to the docs for
 * additional information regarding Pub/Sub events.
 */
@NoArgsConstructor
@Getter
@Setter
public class Body {

  private Message message;

  /**
   * A message from Pub/Sub
   */
  @Getter
  @Setter
  @NoArgsConstructor
  public class Message {

    private String messageId;
    private String publishTime;
    private String data;

    /**
     * Pub/Sub message attributes. Used as the carrier for W3C trace-context
     * headers ({@code traceparent}, {@code tracestate}) so that distributed
     * traces can span the entire audit pipeline. Defaults to an empty map so
     * downstream code can call {@link Map#get(Object)} without null checks.
     */
    private Map<String, String> attributes = new HashMap<>();

    /**
     * Creates a new message
     *
     * @param messageId the message id
     * @param publishTime the publish time
     * @param data the data
     *
     * precondition: messageId != null
     * precondition: publishTime != null
     * precondition: data != null
     */
    public Message(String messageId, String publishTime, String data) {
      assert messageId != null : "messageId must not be null";
      assert publishTime != null : "publishTime must not be null";
      assert data != null : "data must not be null";

      this.messageId = messageId;
      this.publishTime = publishTime;
      this.data = data;
    }
  }
}