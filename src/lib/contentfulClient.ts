import { createClient, Entry } from 'contentful';
import { Page, Section } from '../registry/sectionRegistry';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const PREVIEW_TOKEN = process.env.CONTENTFUL_PREVIEW_TOKEN;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master';

// In-Memory mock database for fallback
const mockPagesDb: Record<string, { published: Page; draft: Page }> = {
  home: {
    published: {
      pageId: 'page-home-pub',
      slug: 'home',
      title: 'Welcome to Page Studio (Published)',
      sections: [
        {
          id: 'hero-1',
          type: 'hero',
          props: {
            title: 'Create Beautiful Pages Instantly',
            subtitle: 'A schema-driven Page Studio built with Next.js, Redux, and Contentful.',
            ctaText: 'Enter Studio',
            ctaUrl: '/studio/home'
          }
        },
        {
          id: 'features-1',
          type: 'featureGrid',
          props: {
            title: 'Key Capabilities',
            features: [
              { title: 'Schema-Driven', description: 'Strict Zod schemas enforce type safety across all rendered sections.', icon: '🛡️' },
              { title: 'Redux State', description: 'Predictable draft states, undo/redo capabilities, and structured store.', icon: '🔄' },
              { title: 'SemVer Versioning', description: 'Deterministic semantic versioning of page states on publication.', icon: '🏷️' }
            ]
          }
        },
        {
          id: 'testimonial-1',
          type: 'testimonial',
          props: {
            quote: 'This Page Studio revolutionized how our marketing team ships landing pages. SemVer releases keep it incredibly safe.',
            author: 'Jane Doe',
            role: 'VP of Marketing'
          }
        },
        {
          id: 'cta-1',
          type: 'cta',
          props: {
            title: 'Ready to build your next experience?',
            description: 'Start editing the homepage layout right now in the interactive studio editor.',
            buttonText: 'Open Studio',
            buttonUrl: '/studio/home'
          }
        }
      ]
    },
    draft: {
      pageId: 'page-home-draft',
      slug: 'home',
      title: 'Welcome to Page Studio (Draft)',
      sections: [
        {
          id: 'hero-1',
          type: 'hero',
          props: {
            title: 'Create Beautiful Pages Instantly (Draft Mode)',
            subtitle: 'A schema-driven Page Studio built with Next.js, Redux, and Contentful.',
            ctaText: 'Enter Studio Now',
            ctaUrl: '/studio/home'
          }
        },
        {
          id: 'features-1',
          type: 'featureGrid',
          props: {
            title: 'Key Capabilities (Draft)',
            features: [
              { title: 'Schema-Driven', description: 'Strict Zod schemas enforce type safety across all rendered sections.', icon: '🛡️' },
              { title: 'Redux State', description: 'Predictable draft states, undo/redo capabilities, and structured store.', icon: '🔄' },
              { title: 'SemVer Versioning', description: 'Deterministic semantic versioning of page states on publication.', icon: '🏷️' }
            ]
          }
        },
        {
          id: 'testimonial-1',
          type: 'testimonial',
          props: {
            quote: 'This Page Studio revolutionized how our marketing team ships landing pages. SemVer releases keep it incredibly safe.',
            author: 'Jane Doe',
            role: 'VP of Marketing'
          }
        },
        {
          id: 'cta-1',
          type: 'cta',
          props: {
            title: 'Ready to build your next experience?',
            description: 'Start editing the homepage layout right now in the interactive studio editor.',
            buttonText: 'Open Studio',
            buttonUrl: '/studio/home'
          }
        }
      ]
    }
  }
};

/**
 * Gets a page from the mock database, making sure to return a copy to prevent accidental mutations.
 */
function getMockPage(slug: string, preview: boolean): Page | null {
  const entry = mockPagesDb[slug];
  if (!entry) return null;
  const page = preview ? entry.draft : entry.published;
  return JSON.parse(JSON.stringify(page)) as Page;
}

// Client configuration
const isConfigured = Boolean(SPACE_ID && (ACCESS_TOKEN || PREVIEW_TOKEN));

const client = isConfigured
  ? createClient({
      space: SPACE_ID!,
      accessToken: ACCESS_TOKEN!,
      environment: ENVIRONMENT,
    })
  : null;

const previewClient = isConfigured && PREVIEW_TOKEN
  ? createClient({
      space: SPACE_ID!,
      accessToken: PREVIEW_TOKEN,
      host: 'preview.contentful.com',
      environment: ENVIRONMENT,
    })
  : null;

/**
 * Adapter implementation
 */
export async function getPageBySlug(slug: string, options?: { preview?: boolean }): Promise<Page | null> {
  const preview = options?.preview ?? false;

  if (!isConfigured) {
    console.log(`Contentful not fully configured. Using mock data (preview: ${preview})`);
    return getMockPage(slug, preview);
  }

  try {
    const activeClient = preview ? (previewClient || client) : client;
    if (!activeClient) throw new Error('Contentful client could not be initialized');

    // Query Contentful for a Page entry matching the slug
    const response = await activeClient.getEntries({
      content_type: 'page', // Expecting a Contentful content model named "page"
      'fields.slug': slug,
      include: 3, // Include nested sections up to 3 levels deep
    });

    if (response.items.length === 0) {
      return null;
    }

    const pageEntry = response.items[0];
    return adaptContentfulPage(pageEntry);
  } catch (error) {
    console.error(`Error fetching page from Contentful for slug "${slug}":`, error);
    // Graceful fallback to mock data on network/API failure so the app doesn't crash
    return getMockPage(slug, preview);
  }
}

/**
 * Adapts Contentful's Entry structure to our clean Page model.
 * Maps Contentful fields to the typed Page/Section objects, isolating Contentful-specific logic.
 */
function adaptContentfulPage(entry: Entry<any>): Page {
  const fields = entry.fields;
  const sectionsList = (fields.sections as any) || [];

  const sections: Section[] = sectionsList.map((secEntry: any) => {
    // If sections are linked entries in Contentful
    const secFields = secEntry.fields || {};
    return {
      id: secEntry.sys?.id || Math.random().toString(36).substring(7),
      type: secEntry.sys?.contentType?.sys?.id || secFields.type || 'unknown',
      props: secFields.props || secFields || {},
    };
  });

  return {
    pageId: entry.sys.id,
    slug: fields.slug as string,
    title: fields.title as string,
    sections,
  };
}
