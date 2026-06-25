import React from 'react';
import fs from 'fs';
import path from 'path';
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

  // Read list of published version snapshots
  const releasesDir = path.join(process.cwd(), 'releases', slug);
  const releasedVersions: { version: string; pageData: any }[] = [];

  if (fs.existsSync(releasesDir)) {
    try {
      const files = fs.readdirSync(releasesDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));
      for (const file of jsonFiles) {
        const filePath = path.join(releasesDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const pageData = JSON.parse(raw);
        releasedVersions.push({
          version: file.replace('.json', ''),
          pageData,
        });
      }
    } catch (e) {
      console.error('Failed to read release snapshots:', e);
    }
  }

  return (
    <ReduxProvider>
      <PreviewClientPage 
        slug={slug} 
        initialPublishedPage={publishedPage} 
        initialDraftPage={draftPage}
        releasedVersions={releasedVersions}
        isUnauthorized={isUnauthorized}
      />
    </ReduxProvider>
  );
}
