/**
 * ============================================================
 * Shortcode Rendering & HTML Escaping Tests
 * ============================================================
 *
 * Purpose:
 *   Verify that the escapeHtml() function and regex replacement logic
 *   used in scripts/shortcodes-custom.js produce secure HTML output.
 *
 * Why we don't require('../scripts/shortcodes-custom.js') directly:
 *   That file references the Hexo global object at module top-level
 *   (hexo.theme.config, hexo.render.renderSync), which doesn't exist
 *   in a plain Node.js test environment. We instead inline an identical
 *   escapeHtml copy and simulate the regex logic.
 *
 * XSS vectors covered:
 *   - < > tag injection       →  escaped to &lt; &gt;
 *   - " ' attribute breakout   →  escaped to &quot; &#39;
 *   - & entity confusion       →  escaped to &amp;
 *   - null/undefined safety    →  handled by String() coercion
 *
 * Shortcodes covered:
 *   - {{Spoiler|Description|text}}  →  spoiler span (title attr escaped)
 *   - {{Tip|Description|text}}      →  admonition tip div
 *   - {{Info|Description|text}}     →  shares regex with Tip
 */

import { describe, it, expect } from 'vitest';

describe('Shortcode Rendering', () => {
  /**
   * escapeHtml — identical to the implementation in scripts/shortcodes-custom.js.
   * Replaces the 5 HTML special characters with their entity references
   * to prevent injection attacks.
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')   // Must be first to avoid double-escaping
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- Basic escaping correctness ----

  it('should escape double quotes and ampersands in spoiler title', () => {
    // Simulate user input containing " and &
    const desc = 'click "here" & see';
    const escaped = escapeHtml(desc);
    expect(escaped).toBe('click &quot;here&quot; &amp; see');
  });

  it('should escape angle brackets and single quotes in blur title', () => {
    // Simulate user input containing < > and '
    const desc = "it's a <secret>";
    const escaped = escapeHtml(desc);
    expect(escaped).toBe('it&#39;s a &lt;secret&gt;');
  });

  // ---- Edge cases ----

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should coerce null and undefined to string', () => {
    // String(null) → 'null', String(undefined) → 'undefined'
    // Ensures no TypeError is thrown
    expect(escapeHtml(null)).toBe('null');
    expect(escapeHtml(undefined)).toBe('undefined');
  });

  // ---- Regex replacement logic verification ----

  it('should render {{Spoiler|Hint|content}} with escaped title attribute', () => {
    // Simulates the Spoiler replacement in before_post_render (shortcodes-custom.js)
    const input = '{{Spoiler|Hint|The cake is a lie.}}';
    const regex = /\{\{Spoiler\|([\s\S]*?)\|([\s\S]+?)\}\}/g;
    const result = input.replace(regex, (_, desc, text) =>
      '<span class="spoiler" tabindex="0" title="' +
      escapeHtml(desc || '你知道的太多了') +
      '">' + text.replace(/\n/g, '<br>') + '</span>'
    );
    expect(result).toContain('class="spoiler"');
    expect(result).toContain('title="Hint"');
    expect(result).toContain('The cake is a lie.');
  });

  it('should render {{Tip||content}} with default label when desc is empty', () => {
    // Verify fallback to default label '提示' when desc is empty
    const input = '{{Tip||A helpful note.}}';
    const regex = /\{\{(?:Tip|Info)\|([\s\S]*?)\|([\s\S]+?)\}\}/g;
    const result = input.replace(regex, (_, desc, text) =>
      '<div class="admonition tip">' + (desc || '提示') + text + '</div>'
    );
    expect(result).toContain('提示');
    expect(result).toContain('A helpful note.');
  });

  it('should not double-escape already-safe text', () => {
    // Plain text should pass through unchanged
    const safe = 'Hello, world!';
    expect(escapeHtml(safe)).toBe('Hello, world!');
  });
});
