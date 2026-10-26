import { describe, it, expect } from 'vitest';
import { normaliseUrl, isValidWebsiteUrl } from './url';

describe('normaliseUrl', () => {
  it('rejects empty and whitespace strings', () => {
    expect(normaliseUrl('')).toEqual({ ok: false, error: 'Enter a website URL.' });
    expect(normaliseUrl('   ')).toEqual({ ok: false, error: 'Enter a website URL.' });
    expect(normaliseUrl(null)).toEqual({ ok: false, error: 'Enter a website URL.' });
    expect(normaliseUrl(undefined)).toEqual({ ok: false, error: 'Enter a website URL.' });
  });

  it('prepends https:// when scheme is absent', () => {
    const res = normaliseUrl('example.com');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.url).toBe('https://example.com/');
      expect(res.schemeAdded).toBe(true);
    }
  });

  it('preserves existing https:// and http:// schemes', () => {
    const resHttps = normaliseUrl('https://example.com/path');
    expect(resHttps.ok).toBe(true);
    if (resHttps.ok) {
      expect(resHttps.url).toBe('https://example.com/path');
      expect(resHttps.schemeAdded).toBe(false);
    }

    const resHttp = normaliseUrl('http://example.com/page');
    expect(resHttp.ok).toBe(true);
    if (resHttp.ok) {
      expect(resHttp.url).toBe('http://example.com/page');
      expect(resHttp.schemeAdded).toBe(false);
    }
  });

  it('accepts modern generic TLDs (.design, .store, .tech, etc.)', () => {
    expect(normaliseUrl('mybrand.design').ok).toBe(true);
    expect(normaliseUrl('shop.store').ok).toBe(true);
    expect(normaliseUrl('coolapp.tech').ok).toBe(true);
  });

  it('rejects localhost and private network ranges for SSRF prevention', () => {
    expect(normaliseUrl('localhost')).toEqual({
      ok: false,
      error: "We can't audit local addresses. Try a public URL.",
    });
    expect(normaliseUrl('127.0.0.1')).toEqual({
      ok: false,
      error: "We can't audit local addresses. Try a public URL.",
    });
    expect(normaliseUrl('http://10.0.0.1:8080')).toEqual({
      ok: false,
      error: "We can't audit local addresses. Try a public URL.",
    });
    expect(normaliseUrl('http://192.168.1.10')).toEqual({
      ok: false,
      error: "We can't audit local addresses. Try a public URL.",
    });
    expect(normaliseUrl('http://172.16.0.5')).toEqual({
      ok: false,
      error: "We can't audit local addresses. Try a public URL.",
    });
    expect(normaliseUrl('app.local')).toEqual({
      ok: false,
      error: "We can't audit local addresses. Try a public URL.",
    });
    expect(normaliseUrl('service.internal')).toEqual({
      ok: false,
      error: "We can't audit local addresses. Try a public URL.",
    });
  });

  it('validates URLs using isValidWebsiteUrl', () => {
    expect(isValidWebsiteUrl('https://google.com')).toBe(true);
    expect(isValidWebsiteUrl('localhost')).toBe(false);
    expect(isValidWebsiteUrl('')).toBe(false);
  });
});
