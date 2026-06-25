import { describe, it, expect } from 'vitest';
import { computeNextVersion } from '../src/lib/semver';
import { Page } from '../src/registry/sectionRegistry';

const initialPage: Page = {
  pageId: 'page1',
  slug: 'home',
  title: 'Home Page',
  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      props: { title: 'Welcome Title', subtitle: 'Some subtitle' }
    },
    {
      id: 'sec-cta',
      type: 'cta',
      props: { title: 'Join Us', buttonText: 'Sign Up', buttonUrl: 'https://example.com' }
    }
  ]
};

describe('SemVer Version Bump Logic', () => {
  it('should return 1.0.0 for initial release if oldPage is null', () => {
    const result = computeNextVersion('0.0.0', null, initialPage);
    expect(result.bumpType).toBe('major');
    expect(result.nextVersion).toBe('1.0.0');
  });

  it('should return same version and bumpType "none" if no changes are made', () => {
    const result = computeNextVersion('1.0.0', initialPage, initialPage);
    expect(result.bumpType).toBe('none');
    expect(result.nextVersion).toBe('1.0.0');
  });

  it('should bump Patch (1.0.1) for simple text / prop change', () => {
    const updatedPage: Page = {
      ...initialPage,
      sections: [
        {
          id: 'sec-hero',
          type: 'hero',
          props: { title: 'Welcome Title (Modified Text)', subtitle: 'Some subtitle' }
        },
        initialPage.sections[1]
      ]
    };
    const result = computeNextVersion('1.0.0', initialPage, updatedPage);
    expect(result.bumpType).toBe('patch');
    expect(result.nextVersion).toBe('1.0.1');
  });

  it('should bump Minor (1.1.0) when adding a section', () => {
    const updatedPage: Page = {
      ...initialPage,
      sections: [
        ...initialPage.sections,
        {
          id: 'sec-testimonial',
          type: 'testimonial',
          props: { quote: 'Great app!', author: 'Alice' }
        }
      ]
    };
    const result = computeNextVersion('1.0.0', initialPage, updatedPage);
    expect(result.bumpType).toBe('minor');
    expect(result.nextVersion).toBe('1.1.0');
  });

  it('should bump Minor (1.1.0) when adding an optional prop', () => {
    const updatedPage: Page = {
      ...initialPage,
      sections: [
        {
          id: 'sec-hero',
          type: 'hero',
          // adding ctaText which is optional
          props: { title: 'Welcome Title', subtitle: 'Some subtitle', ctaText: 'Click here' }
        },
        initialPage.sections[1]
      ]
    };
    const result = computeNextVersion('1.0.0', initialPage, updatedPage);
    expect(result.bumpType).toBe('minor');
    expect(result.nextVersion).toBe('1.1.0');
  });

  it('should bump Major (2.0.0) when removing a section', () => {
    const updatedPage: Page = {
      ...initialPage,
      sections: [initialPage.sections[0]] // sec-cta removed
    };
    const result = computeNextVersion('1.0.0', initialPage, updatedPage);
    expect(result.bumpType).toBe('major');
    expect(result.nextVersion).toBe('2.0.0');
  });

  it('should bump Major (2.0.0) when changing a section type', () => {
    const updatedPage: Page = {
      ...initialPage,
      sections: [
        {
          id: 'sec-hero',
          type: 'cta', // type changed from hero to cta
          props: { title: 'Welcome Title', buttonText: 'Go', buttonUrl: '/' }
        },
        initialPage.sections[1]
      ]
    };
    const result = computeNextVersion('1.0.0', initialPage, updatedPage);
    expect(result.bumpType).toBe('major');
    expect(result.nextVersion).toBe('2.0.0');
  });

  it('should bump Major (2.0.0) when a required prop is broken/missing', () => {
    const updatedPage: Page = {
      ...initialPage,
      sections: [
        initialPage.sections[0],
        {
          id: 'sec-cta',
          type: 'cta',
          // buttonUrl is required but is now missing/empty
          props: { title: 'Join Us', buttonText: 'Sign Up', buttonUrl: '' }
        }
      ]
    };
    const result = computeNextVersion('1.0.0', initialPage, updatedPage);
    expect(result.bumpType).toBe('major');
    expect(result.nextVersion).toBe('2.0.0');
  });
});
