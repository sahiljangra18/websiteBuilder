import { Page, Section, validateSectionProps } from '../registry/sectionRegistry';

export type BumpType = 'major' | 'minor' | 'patch' | 'none';

interface SemVerResult {
  bumpType: BumpType;
  nextVersion: string;
  changelog: string[];
}

const REQUIRED_PROPS: Record<string, string[]> = {
  hero: ['title'],
  featureGrid: ['title'],
  testimonial: ['quote', 'author'],
  cta: ['title', 'buttonText', 'buttonUrl'],
};

export function parseVersion(versionStr: string): { major: number; minor: number; patch: number } {
  const parts = versionStr.split('.').map(Number);
  return {
    major: isNaN(parts[0]) ? 1 : parts[0],
    minor: isNaN(parts[1]) ? 0 : parts[1],
    patch: isNaN(parts[2]) ? 0 : parts[2],
  };
}

export function formatVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`;
}

export function computeNextVersion(
  currentVersion: string,
  oldPage: Page | null,
  newPage: Page
): SemVerResult {
  if (!oldPage) {
    return {
      bumpType: 'major', // First release is 1.0.0
      nextVersion: '1.0.0',
      changelog: ['Initial release (v1.0.0)'],
    };
  }

  const changelog: string[] = [];
  let bumpType: BumpType = 'none';

  const oldSectionsMap = new Map<string, Section>();
  oldPage.sections.forEach(s => oldSectionsMap.set(s.id, s));

  const newSectionsMap = new Map<string, Section>();
  newPage.sections.forEach(s => newSectionsMap.set(s.id, s));

  // 1. Check for removed sections -> MAJOR bump
  for (const [id, oldSec] of oldSectionsMap.entries()) {
    if (!newSectionsMap.has(id)) {
      bumpType = 'major';
      changelog.push(`Removed section "${oldSec.type}" (ID: ${id})`);
    }
  }

  // 2. Check for added sections -> MINOR bump
  for (const [id, newSec] of newSectionsMap.entries()) {
    if (!oldSectionsMap.has(id)) {
      if (bumpType !== 'major') bumpType = 'minor';
      changelog.push(`Added section "${newSec.type}" (ID: ${id})`);
    }
  }

  // 3. Compare existing sections
  for (const [id, newSec] of newSectionsMap.entries()) {
    const oldSec = oldSectionsMap.get(id);
    if (!oldSec) continue;

    // A. Section type change -> MAJOR bump
    if (oldSec.type !== newSec.type) {
      bumpType = 'major';
      changelog.push(`Changed section type from "${oldSec.type}" to "${newSec.type}" (ID: ${id})`);
      continue;
    }

    // B. Check props
    const oldProps = oldSec.props || {};
    const newProps = newSec.props || {};

    // Validate new props first
    const newValidation = validateSectionProps(newSec.type, newProps);
    const oldValidation = validateSectionProps(oldSec.type, oldProps);

    // If new props fail schema validation or miss a required prop that was valid -> MAJOR bump
    if (!newValidation.success) {
      bumpType = 'major';
      changelog.push(`Invalid configuration in section "${newSec.type}" (ID: ${id})`);
      continue;
    }

    const requiredKeys = REQUIRED_PROPS[newSec.type] || [];
    let requiredPropBroken = false;

    // Check for broken required props
    for (const reqKey of requiredKeys) {
      const oldVal = oldProps[reqKey];
      const newVal = newProps[reqKey];
      
      // If previously valid required prop is now deleted, empty, or nil
      if (oldVal !== undefined && (newVal === undefined || newVal === null || newVal === '')) {
        requiredPropBroken = true;
        break;
      }
    }

    if (requiredPropBroken) {
      bumpType = 'major';
      changelog.push(`Broke required field in section "${newSec.type}" (ID: ${id})`);
      continue;
    }

    // Compare all keys to check for minor/patch bumps
    const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

    for (const key of allKeys) {
      const oldVal = oldProps[key];
      const newVal = newProps[key];

      if (oldVal === undefined && newVal !== undefined) {
        // Added an optional prop -> MINOR bump
        if (bumpType !== 'major') bumpType = 'minor';
        changelog.push(`Added optional property "${key}" in section "${newSec.type}"`);
      } else if (oldVal !== undefined && newVal === undefined) {
        // Deleted an optional prop -> MAJOR or MINOR bump
        // If it's a required prop, we already handled it. If it's optional, let's treat it as a minor/major bump.
        // The spec says "remove section / change type / break required prop" for Major.
        // So removing an optional prop can be a minor bump or patch. Let's make it a minor bump.
        if (bumpType !== 'major') bumpType = 'minor';
        changelog.push(`Removed optional property "${key}" in section "${newSec.type}"`);
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        // Modified an existing prop -> PATCH bump
        if (bumpType === 'none') bumpType = 'patch';
        changelog.push(`Updated property "${key}" in section "${newSec.type}"`);
      }
    }
  }

  // Calculate new version number
  const { major, minor, patch } = parseVersion(currentVersion);
  let nextVersion = currentVersion;

  if (bumpType === 'major') {
    nextVersion = formatVersion(major + 1, 0, 0);
  } else if (bumpType === 'minor') {
    nextVersion = formatVersion(major, minor + 1, 0);
  } else if (bumpType === 'patch') {
    nextVersion = formatVersion(major, minor, patch + 1);
  }

  return {
    bumpType,
    nextVersion,
    changelog: changelog.length > 0 ? changelog : ['No functional changes detected'],
  };
}
