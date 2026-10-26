package com.webaudit.utils;

import static org.junit.jupiter.api.Assertions.*;

import java.net.MalformedURLException;
import org.junit.jupiter.api.Test;

public class BrowserUtilsTest {

    @Test
    void testPreservesHttps() throws MalformedURLException {
        String result = BrowserUtils.sanitizeUserUrl("https://example.com");
        assertEquals("https://example.com", result);

        String resultWithPath = BrowserUtils.sanitizeUserUrl("https://example.com/pricing");
        assertEquals("https://example.com/pricing", resultWithPath);
    }

    @Test
    void testPreservesHttp() throws MalformedURLException {
        String result = BrowserUtils.sanitizeUserUrl("http://example.com");
        assertEquals("http://example.com", result);
    }

    @Test
    void testDefaultsToHttpsWhenSchemeOmitted() throws MalformedURLException {
        String result = BrowserUtils.sanitizeUserUrl("example.com");
        assertEquals("https://example.com", result);
    }

    @Test
    void testRemovesWwwAndIndexHtml() throws MalformedURLException {
        String result = BrowserUtils.sanitizeUserUrl("https://www.example.com/index.html");
        assertEquals("https://example.com", result);

        String result2 = BrowserUtils.sanitizeUserUrl("https://www.example.com/about/index.htm");
        assertEquals("https://example.com/about", result2);
    }

    @Test
    void testTrimsTrailingSlash() throws MalformedURLException {
        String result = BrowserUtils.sanitizeUserUrl("https://example.com/");
        assertEquals("https://example.com", result);
    }

    @Test
    void testRejectsLocalhostAndLoopback() {
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://localhost"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://localhost:8080"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://127.0.0.1"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://127.0.0.1:9080"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://0.0.0.0"));
    }

    @Test
    void testRejectsPrivateIpRanges() {
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://10.0.0.1"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://192.168.1.1"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://172.16.0.1"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://172.31.255.255"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://169.254.169.254"));
    }

    @Test
    void testRejectsInternalDomains() {
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://service.local"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://dev.internal"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://mytest.test"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://app.corp"));
    }

    @Test
    void testRejectsDangerousInternalPorts() {
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://example.com:7474"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://example.com:7687"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://example.com:8085"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://example.com:4444"));
    }

    @Test
    void testRejectsUserInfo() {
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("http://admin:secret@example.com"));
    }

    @Test
    void testRejectsUnsupportedProtocols() {
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("ftp://example.com"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("file:///etc/passwd"));
        assertThrows(MalformedURLException.class, () -> BrowserUtils.sanitizeUserUrl("javascript:alert(1)"));
    }
}
