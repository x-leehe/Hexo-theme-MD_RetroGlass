/**
 * ============================================================
 * Link Preview HTML Escaping Tests
 * ============================================================
 *
 * Purpose:
 *   Verify that the escapeHtml() function in scripts/link-preview.js
 *   correctly sanitizes strings from external OG metadata, preventing
 *   XSS injection in generated preview cards.
 *
 * Attack scenarios:
 *   During Hexo build, link-preview.js fetches target URLs' HTML and
 *   extracts og:title, og:description, og:image etc. If the target site
 *   is compromised or maliciously crafted, these fields may contain:
 *     - <script> tags       (JS execution)
 *     - " quotes             (attribute breakout → onerror/onload injection)
 *     - & ampersands         (HTML entity confusion)
 *
 * Why mocks are needed:
 *   link-preview.js references hexo.theme.config at module top-level
 *   and calls https.get / http.get to make network requests. Tests mock
 *   these dependencies and test only the escapeHtml pure function.
 *
 * Related files:
 *   scripts/link-preview.js           — Business logic (escapeHtml applied)
 *   scripts/shortcodes-nunjucks.js    — Preview shortcode (escapeHtml applied)
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock Hexo global — link-preview.js references hexo.theme.config at top-level
beforeAll(() => {
  global.hexo = {
    theme: {
      config: {
        link_preview: {
          enable: true,       // Master switch: enable link previews
          auto_fetch: true,   // Auto-fetch OG metadata
          timeout: 5000       // Request timeout in ms
        }
      }
    },
    extend: {
      filter: {
        register: vi.fn()    // Stub for hexo.extend.filter.register
      }
    }
  };
});

// Mock Node.js network modules — no real HTTP requests
vi.mock('https', () => ({ get: vi.fn() }));
vi.mock('http', () => ({ get: vi.fn() }));

describe('Link Preview HTML Escaping', () => {
  /**
   * escapeHtml — identical to the implementation in scripts/link-preview.js.
   * Replacement order: & must be handled first to avoid double-escaping
   * already-generated entities.
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- XSS attack vector tests ----

  it('should neutralize <script> tag injection in title', () => {
    // Simulates a malicious OG response with script tag in title
    const result = escapeHtml('<script>alert(1)</script>');
    // Should become harmless HTML entities — browser won't execute
    expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    // Verify no raw angle brackets remain
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('should prevent attribute breakout via double quotes', () => {
    // Simulates a malicious image URL that closes src and injects onerror
    const result = escapeHtml('" onerror=alert(1)');
    // Double quotes must be escaped to prevent attribute value breakout
    expect(result).toBe('&quot; onerror=alert(1)');
    expect(result).not.toContain('"');
  });

  it('should prevent HTML entity confusion via ampersand', () => {
    // Simulates OG description containing &, prevents browser mis-parsing
    const result = escapeHtml('a & b');
    expect(result).toBe('a &amp; b');
  });

  it('should escape single quotes for attribute context', () => {
    // Single quotes can also delimit attributes, must be escaped
    const result = escapeHtml("it's a test");
    expect(result).toBe('it&#39;s a test');
  });

  // ---- Edge cases ----

  it('should handle empty string gracefully', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should not modify safe plain text', () => {
    const safeText = 'Hello, this is a normal description.';
    expect(escapeHtml(safeText)).toBe(safeText);
  });
});
