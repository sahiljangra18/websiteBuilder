import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Page, Section } from '../../registry/sectionRegistry';

interface DraftPageState {
  page: Page | null;
  hasUnsavedChanges: boolean;
  history: Page[];
  historyIndex: number;
}

const initialState: DraftPageState = {
  page: null,
  hasUnsavedChanges: false,
  history: [],
  historyIndex: -1,
};

// Helper to save to local storage
const persistToLocalStorage = (slug: string, page: Page) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`studio-draft-${slug}`, JSON.stringify(page));
  }
};

export const draftPageSlice = createSlice({
  name: 'draftPage',
  initialState,
  reducers: {
    initializePage: (state, action: PayloadAction<{ page: Page; forceReload?: boolean }>) => {
      const { page, forceReload } = action.payload;
      let loadedPage = page;
      
      // Try loading from localStorage first to preserve unsaved drafts across reloads
      if (typeof window !== 'undefined' && !forceReload) {
        const cached = localStorage.getItem(`studio-draft-${page.slug}`);
        if (cached) {
          try {
            loadedPage = JSON.parse(cached);
          } catch (e) {
            console.error('Failed to parse cached draft', e);
          }
        }
      }
      
      state.page = loadedPage;
      state.hasUnsavedChanges = false;
      state.history = [loadedPage];
      state.historyIndex = 0;
    },
    addSection: (state, action: PayloadAction<{ type: string; props: Record<string, any> }>) => {
      if (!state.page) return;
      const { type, props } = action.payload;
      const newSection: Section = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        props,
      };
      
      state.page.sections.push(newSection);
      state.hasUnsavedChanges = true;
      persistToLocalStorage(state.page.slug, state.page);
      
      // Update history
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(JSON.parse(JSON.stringify(state.page)));
      state.historyIndex++;
    },
    removeSection: (state, action: PayloadAction<string>) => {
      if (!state.page) return;
      const id = action.payload;
      state.page.sections = state.page.sections.filter(s => s.id !== id);
      state.hasUnsavedChanges = true;
      persistToLocalStorage(state.page.slug, state.page);

      // Update history
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(JSON.parse(JSON.stringify(state.page)));
      state.historyIndex++;
    },
    reorderSections: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      if (!state.page) return;
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex < 0 ||
        fromIndex >= state.page.sections.length ||
        toIndex < 0 ||
        toIndex >= state.page.sections.length
      ) {
        return;
      }
      
      const sections = [...state.page.sections];
      const [removed] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, removed);
      
      state.page.sections = sections;
      state.hasUnsavedChanges = true;
      persistToLocalStorage(state.page.slug, state.page);

      // Update history
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(JSON.parse(JSON.stringify(state.page)));
      state.historyIndex++;
    },
    updateSectionProps: (state, action: PayloadAction<{ id: string; props: Record<string, any> }>) => {
      if (!state.page) return;
      const { id, props } = action.payload;
      const section = state.page.sections.find(s => s.id === id);
      if (section) {
        section.props = { ...section.props, ...props };
        state.hasUnsavedChanges = true;
        persistToLocalStorage(state.page.slug, state.page);

        // Update history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(JSON.parse(JSON.stringify(state.page)));
        state.historyIndex++;
      }
    },
    resetDraft: (state) => {
      if (!state.page) return;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`studio-draft-${state.page.slug}`);
      }
      state.hasUnsavedChanges = false;
      // Note: Re-initialization should be triggered by the view after this to pull fresh from Contentful
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.page = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        state.hasUnsavedChanges = true;
        if (state.page) persistToLocalStorage(state.page.slug, state.page);
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.page = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        state.hasUnsavedChanges = true;
        if (state.page) persistToLocalStorage(state.page.slug, state.page);
      }
    }
  },
});

export const {
  initializePage,
  addSection,
  removeSection,
  reorderSections,
  updateSectionProps,
  resetDraft,
  undo,
  redo,
} = draftPageSlice.actions;

export default draftPageSlice.reducer;
