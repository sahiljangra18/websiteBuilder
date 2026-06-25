'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Page, Section, getSectionComponent, validateSectionProps } from '../../../registry/sectionRegistry';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  initializePage,
  addSection,
  removeSection,
  reorderSections,
  updateSectionProps,
  undo,
  redo,
  resetDraft,
} from '../../../store/slices/draftPageSlice';
import { selectSection, setPreviewDevice, setUserRole, UserRole } from '../../../store/slices/uiSlice';
import { SectionWrapper } from '../../../components/sections/SectionWrapper';
import { publishPage } from '../../actions/publish';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Monitor,
  Smartphone,
  Eye,
  Settings,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface StudioClientPageProps {
  slug: string;
  initialPage: Page | null;
}

export default function StudioClientPage({ slug, initialPage }: StudioClientPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const page = useAppSelector((state) => state.draftPage.page);
  const hasUnsavedChanges = useAppSelector((state) => state.draftPage.hasUnsavedChanges);
  const selectedSectionId = useAppSelector((state) => state.ui.selectedSectionId);
  const previewDevice = useAppSelector((state) => state.ui.previewDevice);
  const currentRole = useAppSelector((state) => state.ui.userRole);

  // Publish Dialog States
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    version?: string;
    changelog?: string[];
    error?: string;
  } | null>(null);

  // Load the initial page into Redux once
  useEffect(() => {
    if (initialPage && !page) {
      dispatch(initializePage({ page: initialPage }));
    }

    // Sync role from cookie on mount
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/user-role=([^;]+)/);
      if (match) {
        const val = match[1];
        if (val === 'viewer' || val === 'editor' || val === 'publisher') {
          dispatch(setUserRole(val));
        }
      }
    }
  }, [initialPage, page, dispatch]);

  // If user role changes to viewer, middleware will kick them out,
  // but let's also force redirect client-side for instant UX feedback.
  useEffect(() => {
    if (currentRole === 'viewer') {
      router.push(`/preview/${slug}?error=unauthorized`);
    }
  }, [currentRole, slug, router]);

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-2" />
        <span>Loading Page Draft State...</span>
      </div>
    );
  }

  const selectedSection = page.sections.find((s) => s.id === selectedSectionId);

  // Add Section Handler
  const handleAddSection = (type: string) => {
    let defaultProps: Record<string, any> = {};
    if (type === 'hero') {
      defaultProps = { title: 'New Hero Section', subtitle: 'Add a description here', ctaText: 'Get Started', ctaUrl: '/' };
    } else if (type === 'featureGrid') {
      defaultProps = { title: 'Our Features', features: [{ title: 'Feature 1', description: 'Feature description', icon: '⚡' }] };
    } else if (type === 'testimonial') {
      defaultProps = { quote: 'This is a fantastic quote!', author: 'Famous Person', role: 'Executive Officer' };
    } else if (type === 'cta') {
      defaultProps = { title: 'Join our newsletter today', description: 'Don\'t miss out on updates', buttonText: 'Sign Up', buttonUrl: '/' };
    }
    dispatch(addSection({ type, props: defaultProps }));
  };

  // Publish flow execution
  const handlePublish = () => {
    startTransition(async () => {
      setPublishResult(null);
      const res = await publishPage(slug, page);
      setPublishResult(res);
      if (res.success) {
        // Clear local storage draft upon successful publication
        dispatch(resetDraft());
      }
    });
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Skip links for keyboard accessibility */}
      <a href="#editor-main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md">
        Skip to main editing window
      </a>

      {/* Main Studio Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-4 py-3 flex flex-wrap items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            href={`/preview/${slug}`}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Back to preview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold flex items-center gap-2">
              Studio Workspace
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                /{slug}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Design and publish in real-time</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => dispatch(undo())}
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Undo last action"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(redo())}
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Redo action"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Device Toggles */}
          <div className="flex bg-slate-850 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => dispatch(setPreviewDevice('desktop'))}
              className={`p-1.5 rounded-md transition-all ${
                previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop Preview"
              aria-label="Desktop Preview Mode"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(setPreviewDevice('mobile'))}
              className={`p-1.5 rounded-md transition-all ${
                previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile Preview"
              aria-label="Mobile Preview Mode"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Simulated Role Switcher */}
          <div className="flex items-center space-x-2">
            <label htmlFor="studio-role-select" className="text-xs text-slate-400 font-medium">Role:</label>
            <select
              id="studio-role-select"
              value={currentRole}
              onChange={(e) => dispatch(setUserRole(e.target.value as UserRole))}
              className="bg-slate-850 text-slate-200 border border-slate-700 rounded-lg text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="editor">Editor</option>
              <option value="publisher">Publisher</option>
            </select>
          </div>

          {/* Unsaved Indicator */}
          {hasUnsavedChanges && (
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Unsaved draft
            </span>
          )}

          {/* Publish Trigger */}
          <button
            onClick={() => {
              setPublishResult(null);
              setIsPublishModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-blue-800"
          >
            <Save className="w-3.5 h-3.5" />
            Publish...
          </button>
        </div>
      </header>

      {/* Main Studio Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Sections List / Tree */}
        <aside className="w-64 border-r border-slate-850 bg-slate-900/50 flex flex-col shrink-0" aria-label="Page sections directory">
          <div className="p-4 border-b border-slate-850">
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Page Sections</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {page.sections.map((sec, idx) => {
              const isSelected = sec.id === selectedSectionId;
              return (
                <div
                  key={sec.id}
                  className={`group rounded-lg p-2.5 border transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => dispatch(selectSection(sec.id))}
                      className="text-left font-medium text-xs text-slate-200 hover:text-white truncate flex-1 focus:outline-none"
                    >
                      <span className="font-mono text-[10px] text-slate-500 mr-1.5">#{idx + 1}</span>
                      {(sec.props.title as string) || sec.type}
                    </button>
                    {/* Actions: Reorder and Delete */}
                    <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => dispatch(reorderSections({ fromIndex: idx, toIndex: idx - 1 }))}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        aria-label="Move section up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => dispatch(reorderSections({ fromIndex: idx, toIndex: idx + 1 }))}
                        disabled={idx === page.sections.length - 1}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        aria-label="Move section down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => dispatch(removeSection(sec.id))}
                        className="p-1 rounded hover:bg-red-950 hover:text-red-400 text-slate-400"
                        aria-label="Delete section"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 capitalize">{sec.type}</div>
                </div>
              );
            })}

            {page.sections.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No sections yet. Add one below!</p>
            )}
          </div>

          {/* Add Section Controls */}
          <div className="p-3 border-t border-slate-850 bg-slate-900">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Add New Section</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAddSection('hero')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center justify-center gap-1 focus:outline-none"
              >
                <Plus className="w-3 h-3" /> Hero
              </button>
              <button
                onClick={() => handleAddSection('featureGrid')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center justify-center gap-1 focus:outline-none"
              >
                <Plus className="w-3 h-3" /> Features
              </button>
              <button
                onClick={() => handleAddSection('testimonial')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center justify-center gap-1 focus:outline-none"
              >
                <Plus className="w-3 h-3" /> Quote
              </button>
              <button
                onClick={() => handleAddSection('cta')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center justify-center gap-1 focus:outline-none"
              >
                <Plus className="w-3 h-3" /> CTA
              </button>
            </div>
          </div>
        </aside>

        {/* Central visual preview frame */}
        <main
          id="editor-main-content"
          className="flex-1 bg-slate-950 p-6 overflow-y-auto flex justify-center items-start"
          aria-label="Layout live preview"
        >
          <div
            className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
              previewDevice === 'mobile' ? 'max-w-md w-full border-4 border-slate-700 rounded-3xl' : 'w-full'
            }`}
          >
            {/* Embedded device header for mobile */}
            {previewDevice === 'mobile' && (
              <div className="bg-slate-800 h-6 w-full flex justify-center items-center gap-1">
                <div className="w-12 h-3 rounded bg-slate-900"></div>
              </div>
            )}
            
            <div className="divide-y divide-slate-800">
              {page.sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => dispatch(selectSection(section.id))}
                  className={`relative cursor-pointer transition-all ${
                    selectedSectionId === section.id
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 z-10'
                      : 'hover:ring-1 hover:ring-slate-700'
                  }`}
                >
                  <div className="absolute top-2 left-2 z-25 bg-slate-900/90 border border-slate-700 rounded px-1.5 py-0.5 text-[9px] font-mono text-slate-300 pointer-events-none capitalize">
                    {section.type}
                  </div>
                  <SectionWrapper id={section.id} type={section.type} props={section.props} />
                </div>
              ))}

              {page.sections.length === 0 && (
                <div className="py-24 text-center text-slate-500">
                  <Sparkles className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                  <p className="font-semibold text-slate-400">Empty Page Layout</p>
                  <p className="text-xs text-slate-600 mt-1">Select sections on the left to start building.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Panel: Property editor form */}
        <aside className="w-80 border-l border-slate-850 bg-slate-900/50 flex flex-col shrink-0" aria-label="Section properties manager">
          <div className="p-4 border-b border-slate-850">
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Properties Editor</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedSection ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                  <span className="text-sm font-semibold capitalize text-slate-200">{selectedSection.type} Properties</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{selectedSection.id}</span>
                </div>

                {/* Hero Properties */}
                {selectedSection.type === 'hero' && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="hero-title" className="block text-xs font-semibold text-slate-400 mb-1">
                        Hero Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="hero-title"
                        type="text"
                        value={(selectedSection.props.title as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { title: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs"
                      />
                      {(!selectedSection.props.title || (selectedSection.props.title as string).trim() === '') && (
                        <p className="text-[10px] text-red-400 mt-1">Title is required</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="hero-subtitle" className="block text-xs font-semibold text-slate-400 mb-1">
                        Subtitle
                      </label>
                      <textarea
                        id="hero-subtitle"
                        rows={3}
                        value={(selectedSection.props.subtitle as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { subtitle: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="hero-cta-text" className="block text-xs font-semibold text-slate-400 mb-1">
                        CTA Label
                      </label>
                      <input
                        id="hero-cta-text"
                        type="text"
                        value={(selectedSection.props.ctaText as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { ctaText: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="hero-cta-url" className="block text-xs font-semibold text-slate-400 mb-1">
                        CTA Link URL
                      </label>
                      <input
                        id="hero-cta-url"
                        type="text"
                        value={(selectedSection.props.ctaUrl as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { ctaUrl: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs font-mono"
                      />
                      {Boolean(selectedSection.props.ctaUrl) &&
                        !(selectedSection.props.ctaUrl as string).startsWith('/') &&
                        !(selectedSection.props.ctaUrl as string).startsWith('http') && (
                          <p className="text-[10px] text-yellow-400 mt-1">Must be valid URL or absolute path (e.g. /about)</p>
                        )}
                    </div>
                  </div>
                )}

                {/* CTA Properties */}
                {selectedSection.type === 'cta' && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="cta-title" className="block text-xs font-semibold text-slate-400 mb-1">
                        CTA Headline <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="cta-title"
                        type="text"
                        value={(selectedSection.props.title as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { title: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="cta-desc" className="block text-xs font-semibold text-slate-400 mb-1">
                        Description
                      </label>
                      <textarea
                        id="cta-desc"
                        rows={3}
                        value={(selectedSection.props.description as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { description: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="cta-btn-text" className="block text-xs font-semibold text-slate-400 mb-1">
                        Button Label <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="cta-btn-text"
                        type="text"
                        value={(selectedSection.props.buttonText as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { buttonText: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="cta-btn-url" className="block text-xs font-semibold text-slate-400 mb-1">
                        Button Link URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="cta-btn-url"
                        type="text"
                        value={(selectedSection.props.buttonUrl as string) || ''}
                        onChange={(e) =>
                          dispatch(
                            updateSectionProps({ id: selectedSection.id, props: { buttonUrl: e.target.value } })
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {selectedSection.type !== 'hero' && selectedSection.type !== 'cta' && (
                  <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg text-slate-400 text-xs">
                    <Info className="w-4 h-4 text-blue-400 inline mr-2" />
                    Property editing for section type <code className="text-slate-200">{selectedSection.type}</code> is managed globally or through Contentful.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Settings className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                Select a section in the layout or left list to modify properties.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Publish Confirmation & Version Bump Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="publish-modal-title">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h2 id="publish-modal-title" className="text-md font-bold text-white flex items-center gap-1.5">
                <Save className="w-5 h-5 text-blue-500" />
                Publish Immutable Release
              </h2>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh]">
              {/* If user doesn't have publisher role */}
              {currentRole !== 'publisher' ? (
                <div className="bg-red-950/60 border border-red-800 text-red-200 p-4 rounded-lg text-xs space-y-2">
                  <p className="font-semibold flex items-center gap-1.5 text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    Role Restriction: Publisher Needed
                  </p>
                  <p>
                    Your current role is set to <strong>{currentRole}</strong>. In production, only users with the <strong>publisher</strong> role are permitted to create new releases.
                  </p>
                  <p className="text-[11px] text-red-400">
                    Tip: Switch your simulation role to <strong>Publisher</strong> in the editor top bar to bypass this lock.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg space-y-2 text-xs">
                    <p className="font-medium text-slate-300">How publication works:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>Compares the draft layout with the last release.</li>
                      <li>Computes SemVer bump (Major/Minor/Patch) deterministically.</li>
                      <li>Saves an immutable snapshot as a versioned JSON record.</li>
                    </ul>
                  </div>

                  {publishResult === null && !isPending && (
                    <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded-lg text-xs text-blue-300">
                      Press <strong>Confirm Publish</strong> to calculate changes and freeze the release.
                    </div>
                  )}
                </>
              )}

              {/* Loader */}
              {isPending && (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-xs text-slate-400">Comparing layouts and bumping SemVer...</span>
                </div>
              )}

              {/* Publish Result Feedback */}
              {publishResult && (
                <div className="space-y-4">
                  {publishResult.success ? (
                    <div className="space-y-3">
                      <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-200 p-4 rounded-lg flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-xs text-emerald-300">Release Published Successfully!</p>
                          <p className="text-[11px] text-emerald-400 mt-1">
                            New version: <strong className="font-mono text-white text-xs">{publishResult.version}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg text-xs">
                        <p className="font-bold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">Release Changelog</p>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 font-mono">
                          {publishResult.changelog?.map((change, i) => (
                            <li key={i}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-950/40 border border-red-800 text-red-200 p-4 rounded-lg flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-xs text-red-300">Publish Failed</p>
                        <p className="text-[11px] text-slate-400 mt-1">{publishResult.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-850 flex items-center justify-end space-x-3 shrink-0">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-white focus:outline-none"
              >
                {publishResult?.success ? 'Close' : 'Cancel'}
              </button>
              {currentRole === 'publisher' && !publishResult?.success && !isPending && (
                <button
                  onClick={handlePublish}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors focus:outline-none"
                >
                  Confirm Publish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
