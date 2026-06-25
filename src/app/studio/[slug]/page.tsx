import React from 'react';
import { getPageBySlug } from '../../../lib/contentfulClient';
import StudioClientPage from './StudioClientPage';
import { ReduxProvider } from '../../../components/providers/ReduxProvider';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StudioPage(props: PageProps) {
  const params = await props.params;
  const slug = params.slug || 'home';

  // Load draft configuration from Contentful server-side as base
  const page = await getPageBySlug(slug, { preview: true });

  return (
    <ReduxProvider>
      <StudioClientPage slug={slug} initialPage={page} />
    </ReduxProvider>
  );
}
