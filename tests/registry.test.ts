import { describe, it, expect } from 'vitest';
import { validateSectionProps, getSectionComponent } from '../src/registry/sectionRegistry';
import { UnsupportedSection } from '../src/components/sections/UnsupportedSection';

describe('Section Registry and Validation', () => {
  it('should validate valid Hero props successfully', () => {
    const validHeroProps = {
      title: 'Welcome to Page Studio',
      subtitle: 'Build and publish landing pages',
      ctaText: 'Get Started',
      ctaUrl: 'https://example.com/start',
    };
    const result = validateSectionProps('hero', validHeroProps);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validHeroProps);
  });

  it('should fail validation for invalid Hero props', () => {
    const invalidHeroProps = {
      // title is missing
      subtitle: 'Build and publish landing pages',
      ctaUrl: 'not-a-valid-url', // url schema validation should trigger
    };
    const result = validateSectionProps('hero', invalidHeroProps);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('should fall back to UnsupportedSection for unknown section types', () => {
    const component = getSectionComponent('customNonExistentSection');
    expect(component).toBe(UnsupportedSection);
  });
});
