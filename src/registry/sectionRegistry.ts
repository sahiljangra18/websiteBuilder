import { z } from 'zod';
import React from 'react';
import { HeroSection } from '../components/sections/Hero';
import { FeatureGridSection } from '../components/sections/FeatureGrid';
import { TestimonialSection } from '../components/sections/Testimonial';
import { CTASection } from '../components/sections/CTA';
import { UnsupportedSection } from '../components/sections/UnsupportedSection';

// Hero Section Schema
export const HeroPropsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url("Must be a valid URL").or(z.string().startsWith('/')).optional(),
});

// Feature Grid Section Schema
export const FeatureItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const FeatureGridPropsSchema = z.object({
  title: z.string().min(1),
  features: z.array(FeatureItemSchema).default([]),
});

// Testimonial Section Schema
export const TestimonialPropsSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
});

// CTA Section Schema
export const CTAPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  buttonText: z.string().min(1),
  buttonUrl: z.string().url("Must be a valid URL").or(z.string().startsWith('/')),
});

// Section types
export type SectionType = 'hero' | 'featureGrid' | 'testimonial' | 'cta';

// Dynamic Props Mapping
export const sectionPropsSchemas = {
  hero: HeroPropsSchema,
  featureGrid: FeatureGridPropsSchema,
  testimonial: TestimonialPropsSchema,
  cta: CTAPropsSchema,
} as const;

// Base Section Schema
export const SectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
});

export type Section = z.infer<typeof SectionSchema>;

export const PageSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(SectionSchema),
});

export type Page = z.infer<typeof PageSchema>;

// Registry mapping types to components
export const sectionRegistry: Record<
  string,
  React.ComponentType<{ id: string; props: any; isEditable?: boolean; onEdit?: () => void }>
> = {
  hero: HeroSection,
  featureGrid: FeatureGridSection,
  testimonial: TestimonialSection,
  cta: CTASection,
};

/**
 * Gets a component for a section type, falling back to UnsupportedSection
 */
export function getSectionComponent(type: string) {
  return sectionRegistry[type] || UnsupportedSection;
}

/**
 * Validates props for a given section type.
 * Returns either the parsed data or an array of validation errors.
 */
export function validateSectionProps(type: string, props: unknown) {
  const schema = sectionPropsSchemas[type as SectionType];
  if (!schema) {
    return { success: false, errors: ['Unknown section type'] };
  }
  const result = schema.safeParse(props);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`),
    };
  }
  return { success: true, data: result.data };
}
