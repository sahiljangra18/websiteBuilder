import { describe, it, expect } from 'vitest';
import { getPageBySlug } from '../src/lib/contentfulClient';

describe('Contentful Client Adapter', () => {
  it('should load published page when preview options are not passed or false', async () => {
    const page = await getPageBySlug('home', { preview: false });
    expect(page).not.toBeNull();
    expect(page?.slug).toBe('home');
    expect(page?.title).toContain('(Published)');
    expect(page?.sections.length).toBeGreaterThan(0);
  });

  it('should load draft page when preview option is true', async () => {
    const page = await getPageBySlug('home', { preview: true });
    expect(page).not.toBeNull();
    expect(page?.slug).toBe('home');
    expect(page?.title).toContain('(Draft)');
    expect(page?.sections.length).toBeGreaterThan(0);
  });

  it('should return null for non-existent page slug', async () => {
    const page = await getPageBySlug('non-existent-slug');
    expect(page).toBeNull();
  });
});
