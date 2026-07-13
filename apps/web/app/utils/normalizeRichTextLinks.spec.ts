import { describe, expect, it } from 'vitest';
import { normalizeRichTextLinks } from './normalizeRichTextLinks';

const shopOrigin = 'https://www.nubuk-bikes.de';

describe('normalizeRichTextLinks', () => {
  it('normalizes a domain-like href and secures the external target', () => {
    const html = '<p>Zur <a href="calendly.com/nubuk-bikes/">Werkstatt</a></p>';

    expect(normalizeRichTextLinks(html, shopOrigin)).toBe(
      '<p>Zur <a href="https://calendly.com/nubuk-bikes/" target="_blank" rel="noopener noreferrer">Werkstatt</a></p>',
    );
  });

  it('adds target and merges rel values on an external link', () => {
    const html = '<a href="https://example.com" target="_self" rel="nofollow">Extern</a>';

    expect(normalizeRichTextLinks(html, shopOrigin)).toBe(
      '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">Extern</a>',
    );
  });

  it.each([
    '<a href="/produkte/teile/">Intern</a>',
    '<a href="https://www.nubuk-bikes.de/produkte/teile/">Eigene Domain</a>',
    '<a href="#details">Details</a>',
    '<a href="mailto:info@nubuk-bikes.de">E-Mail</a>',
    '<a href="tel:+49717112345">Telefon</a>',
  ])('leaves internal and special links unchanged: %s', (html) => {
    expect(normalizeRichTextLinks(html, shopOrigin)).toBe(html);
  });

  it('does not confuse data attributes with link attributes', () => {
    const html = '<a data-href="example.com" href="/intern" data-target="modal">Intern</a>';

    expect(normalizeRichTextLinks(html, shopOrigin)).toBe(html);
  });
});
