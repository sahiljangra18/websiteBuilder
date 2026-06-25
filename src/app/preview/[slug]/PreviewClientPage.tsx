'use client';

import React, { useEffect, useState } from 'react';
import { Page } from '../../../registry/sectionRegistry';
import { SectionWrapper } from '../../../components/sections/SectionWrapper';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setUserRole, UserRole } from '../../../store/slices/uiSlice';
import { Eye, ShieldAlert, ArrowRight, Settings, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface PreviewClientPageProps {
  slug: string;
  initialPublishedPage: Page | null;
  initialDraftPage: Page | null;
  releasedVersions?: { version: string; pageData: Page }[];
  isUnauthorized?: boolean;
}

export default function PreviewClientPage({
  slug,
  initialPublishedPage,
  initialDraftPage,
  releasedVersions = [],
  isUnauthorized = false,
}: PreviewClientPageProps) {
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.ui.userRole);
  
  const [sourceMode, setSourceMode] = useState<'published' | 'contentful-draft' | 'local-draft' | 'release'>('published');
  const [selectedReleaseVersion, setSelectedReleaseVersion] = useState<string>('');
  const [activePage, setActivePage] = useState<Page | null>(initialPublishedPage);
  const [showRoleBanner, setShowRoleBanner] = useState(isUnauthorized);
  
  // Load local draft if available
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [localDraftPage, setLocalDraftPage] = useState<Page | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`studio-draft-${slug}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Page;
          setLocalDraftPage(parsed);
          setHasLocalDraft(true);
          // Auto switch to local draft if it exists to show current work
          setSourceMode('local-draft');
          setActivePage(parsed);
        } catch (e) {
          console.error('Failed to load local draft page', e);
        }
      }

      // Sync role from cookie on mount
      const match = document.cookie.match(/user-role=([^;]+)/);
      if (match) {
        const val = match[1];
        if (val === 'viewer' || val === 'editor' || val === 'publisher') {
          dispatch(setUserRole(val));
        }
      }
    }
  }, [slug, dispatch]);

  // Handle switching data source
  const handleSourceChange = (mode: 'published' | 'contentful-draft' | 'local-draft') => {
    setSourceMode(mode);
    setSelectedReleaseVersion('');
    if (mode === 'published') {
      setActivePage(initialPublishedPage);
    } else if (mode === 'contentful-draft') {
      setActivePage(initialDraftPage);
    } else if (mode === 'local-draft') {
      setActivePage(localDraftPage || initialDraftPage || initialPublishedPage);
    }
  };

  // Handle role changes
  const handleRoleChange = (role: UserRole) => {
    dispatch(setUserRole(role));
    setShowRoleBanner(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Accessibility Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Skip to main content
      </a>

      {/* RBAC Simulation and Control Toolbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Brand/Slug */}
          <div className="flex items-center space-x-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md">
              P
            </span>
            <div>
              <h1 className="text-md font-bold tracking-tight text-white flex items-center gap-2">
                Page Studio Preview
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  /{slug}
                </span>
              </h1>
            </div>
          </div>

          {/* Controls: Role switcher and Page Source selector */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Simulation Role Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="role-select" className="text-xs font-semibold text-slate-400">
                Simulate Role:
              </label>
              <select
                id="role-select"
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="bg-slate-850 text-slate-200 border border-slate-700 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="viewer">Viewer (Read-only)</option>
                <option value="editor">Editor (Can edit)</option>
                <option value="publisher">Publisher (Can publish)</option>
              </select>
            </div>

            {/* Source Mode Toggle */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1">
              <button
                onClick={() => handleSourceChange('published')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  sourceMode === 'published'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-pressed={sourceMode === 'published'}
              >
                Published
              </button>
              <button
                onClick={() => handleSourceChange('contentful-draft')}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                  sourceMode === 'contentful-draft'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-pressed={sourceMode === 'contentful-draft'}
              >
                Contentful Draft
              </button>
              {hasLocalDraft && (
                <button
                  onClick={() => handleSourceChange('local-draft')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 ${
                    sourceMode === 'local-draft'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-pressed={sourceMode === 'local-draft'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  Local Studio Draft
                </button>
              )}
            </div>

            {/* Versioned Releases Selector */}
            {releasedVersions && releasedVersions.length > 0 && (
              <div className="flex items-center space-x-2">
                <label htmlFor="version-select" className="text-xs font-semibold text-slate-400">
                  Release:
                </label>
                <select
                  id="version-select"
                  value={sourceMode === 'release' ? selectedReleaseVersion : ''}
                  onChange={(e) => {
                    const ver = e.target.value;
                    if (ver) {
                      const rel = releasedVersions.find((r) => r.version === ver);
                      if (rel) {
                        setSourceMode('release');
                        setSelectedReleaseVersion(ver);
                        setActivePage(rel.pageData);
                      }
                    }
                  }}
                  className="bg-slate-850 text-slate-200 border border-slate-700 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="" disabled>Select version...</option>
                  {releasedVersions.map((rel) => (
                    <option key={rel.version} value={rel.version}>
                      v{rel.version}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Link to Studio */}
            {currentRole !== 'viewer' ? (
              <Link
                href={`/studio/${slug}`}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-blue-800"
              >
                <Settings className="w-3.5 h-3.5" />
                Open Studio
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span 
                className="bg-slate-800 text-slate-500 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-not-allowed"
                title="Viewers cannot access the Studio"
              >
                <Settings className="w-3.5 h-3.5" />
                Studio Locked
              </span>
            )}

            {/* Logout Button */}
            <button
              onClick={() => {
                document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
                window.location.href = '/login';
              }}
              className="border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Unauthorized RBAC Toast/Banner */}
      {showRoleBanner && (
        <div 
          className="bg-red-950/80 border-b border-red-800 text-red-200 px-4 py-3 flex items-center justify-between text-sm"
          role="alert"
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>
              <strong>Access Denied:</strong> Your role ({currentRole}) does not have permissions to access the Studio. Please switch your simulated role in the toolbar above.
            </span>
          </div>
          <button 
            onClick={() => setShowRoleBanner(false)}
            className="text-red-400 hover:text-red-200 font-bold ml-4"
            aria-label="Close alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Source Label Indicator */}
      <div className="bg-slate-900 px-6 py-2 border-b border-slate-850 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>
            Viewing source:{' '}
            <strong className="text-slate-200 uppercase font-mono">
              {sourceMode === 'published' && 'Contentful Published'}
              {sourceMode === 'contentful-draft' && 'Contentful Draft'}
              {sourceMode === 'local-draft' && 'Local Studio Unsaved Draft'}
              {sourceMode === 'release' && `Published Release v${selectedReleaseVersion}`}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Role: <strong className="text-slate-200 uppercase">{currentRole}</strong></span>
        </div>
      </div>

      {/* Main Landing Page Rendered Area */}
      <main id="main-content" className="flex-1 bg-slate-900">
        {activePage && activePage.sections && activePage.sections.length > 0 ? (
          activePage.sections.map((section) => (
            <SectionWrapper
              key={section.id}
              id={section.id}
              type={section.type}
              props={section.props}
            />
          ))
        ) : (
          <div className="py-24 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300">No content available for this layout</h2>
            <p className="text-sm text-slate-500 mt-2">
              Start editing this page in the Studio or check Contentful configuration.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
