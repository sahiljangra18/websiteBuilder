'use server';

import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { Page, PageSchema } from '../../registry/sectionRegistry';
import { computeNextVersion, parseVersion } from '../../lib/semver';

interface PublishResponse {
  success: boolean;
  version?: string;
  changelog?: string[];
  error?: string;
}

export async function publishPage(slug: string, pageData: unknown): Promise<PublishResponse> {
  try {
    // 1. Enforce RBAC
    const cookieStore = await cookies();
    const role = cookieStore.get('user-role')?.value || 'viewer';

    if (role !== 'publisher') {
      return {
        success: false,
        error: `Access Denied: Only users with the 'publisher' role can publish releases. Current role: ${role}`,
      };
    }

    // 2. Validate input schema
    const parsedPage = PageSchema.safeParse(pageData);
    if (!parsedPage.success) {
      return {
        success: false,
        error: `Invalid draft schema: ${parsedPage.error.issues.map(e => e.message).join(', ')}`,
      };
    }

    const draftPage = parsedPage.data;
    const releasesDir = path.join(process.cwd(), 'releases', slug);

    // Create releases directory if it doesn't exist
    if (!fs.existsSync(releasesDir)) {
      fs.mkdirSync(releasesDir, { recursive: true });
    }

    // 3. Scan for existing releases and find the latest version
    const files = fs.readdirSync(releasesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    let latestVersionStr = '0.0.0';
    let latestPageSnapshot: Page | null = null;

    if (jsonFiles.length > 0) {
      // Find the latest version using SemVer rules
      let maxMajor = 0;
      let maxMinor = 0;
      let maxPatch = 0;
      let maxVerStr = '0.0.0';

      for (const file of jsonFiles) {
        const verStr = file.replace('.json', '');
        const { major, minor, patch } = parseVersion(verStr);
        
        if (
          major > maxMajor ||
          (major === maxMajor && minor > maxMinor) ||
          (major === maxMajor && minor === maxMinor && patch > maxPatch)
        ) {
          maxMajor = major;
          maxMinor = minor;
          maxPatch = patch;
          maxVerStr = verStr;
        }
      }

      latestVersionStr = maxVerStr;
      
      // Read the latest snapshot
      try {
        const snapshotRaw = fs.readFileSync(path.join(releasesDir, `${latestVersionStr}.json`), 'utf-8');
        latestPageSnapshot = JSON.parse(snapshotRaw);
      } catch (e) {
        console.error('Failed to read previous release snapshot', e);
      }
    }

    // 4. Compute next version and check for differences
    const { bumpType, nextVersion, changelog } = computeNextVersion(
      latestVersionStr,
      latestPageSnapshot,
      draftPage
    );

    // 5. Idempotent publish checks
    if (bumpType === 'none') {
      return {
        success: true,
        version: latestVersionStr,
        changelog: ['No changes detected. Release is up to date.'],
      };
    }

    // 6. Save new immutable version snapshot
    const newReleasePath = path.join(releasesDir, `${nextVersion}.json`);
    fs.writeFileSync(newReleasePath, JSON.stringify(draftPage, null, 2), 'utf-8');

    return {
      success: true,
      version: nextVersion,
      changelog,
    };
  } catch (error: any) {
    console.error('Error during publish flow:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during publishing.',
    };
  }
}
