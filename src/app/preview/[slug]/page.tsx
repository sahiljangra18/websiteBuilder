import React from 'react';
import { getPageBySlug } from '../../../lib/contentfulClient';
import PreviewClientPage from './PreviewClientPage';
import { ReduxProvider } from '../../../components/providers/ReduxProvider';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PreviewPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params.slug || 'home';
  const isUnauthorized = searchParams.error === 'unauthorized';

  // Load baseline Contentful published and draft data from the adapter server-side
  const publishedPage = await getPageBySlug(slug, { preview: false });
  const draftPage = await getPageBySlug(slug, { preview: true });

  return (
    <ReduxProvider>
      <PreviewClientPage 
        slug={slug} 
        initialPublishedPage={publishedPage} 
        initialDraftPage={draftPage}
        isUnauthorized={isUnauthorized}
      />
    </ReduxProvider>
  );
}
