import { describe, it, expect } from 'vitest';
import { executeDynamicAudit } from './auditEngine';

describe('auditEngine', () => {
  it('generates real dynamic audit for https://devdocs.io/fastapi/', () => {
    const result = executeDynamicAudit('https://devdocs.io/fastapi/');

    expect(result.record.url).toBe('https://devdocs.io/fastapi/');
    expect(result.record.status).toBe('COMPLETE');
    expect(result.page.url).toBe('https://devdocs.io/fastapi/');
    expect(result.page.fullPageScreenshotUrl).toContain('data:image/svg+xml');

    // Verify DevDocs FastAPI specific elements
    const elementSelectors = result.binding.elements.map((e) => e.cssSelector);
    expect(elementSelectors).toContain('head > meta[name="viewport"]');
    expect(elementSelectors).toContain(
      'header._header > form._search input[type="search"]._search-input'
    );
    expect(elementSelectors).toContain('header._header > nav._menu h1._menu-title');

    // Verify DevDocs FastAPI specific issues
    const issueKeys = result.binding.issues.map((i) => i.key);
    expect(issueKeys).toContain('issue-viewport-zoom');
    expect(issueKeys).toContain('issue-heading-misplaced');
    expect(issueKeys).toContain('issue-search-label');
    expect(issueKeys).toContain('issue-sidebar-contrast');

    // Verify calculated scores
    expect(result.binding.scores.overallScore).toBe(78);
    expect(result.binding.scores.aestheticsScore).toBe(74);
    expect(result.binding.scores.informationArchitectureScore).toBe(72);
  });

  it('generates dynamic audit for an arbitrary domain', () => {
    const result = executeDynamicAudit('https://my-custom-saas.com/pricing');

    expect(result.record.url).toBe('https://my-custom-saas.com/pricing');
    expect(result.page.fullPageScreenshotUrl).toContain('my-custom-saas.com');
    expect(result.binding.issues.length).toBeGreaterThan(0);
    expect(result.binding.elements.length).toBeGreaterThan(0);
    expect(result.binding.scores.overallScore).toBeGreaterThan(50);
  });
});
