import { describe, it, expect } from 'vitest';
import draftPageReducer, {
  initializePage,
  addSection,
  removeSection,
  reorderSections,
  updateSectionProps,
} from '../src/store/slices/draftPageSlice';
import { Page } from '../src/registry/sectionRegistry';

const mockPage: Page = {
  pageId: '123',
  slug: 'test-page',
  title: 'Test Page',
  sections: [
    { id: 's1', type: 'hero', props: { title: 'Section 1' } },
    { id: 's2', type: 'cta', props: { title: 'Section 2', buttonText: 'Click', buttonUrl: '/' } },
  ],
};

describe('Redux draftPage Slice', () => {
  it('should initialize page correctly', () => {
    const state = draftPageReducer(undefined, initializePage({ page: mockPage }));
    expect(state.page).toEqual(mockPage);
    expect(state.hasUnsavedChanges).toBe(false);
  });

  it('should add a section', () => {
    const stateWithPage = draftPageReducer(undefined, initializePage({ page: mockPage }));
    const newState = draftPageReducer(
      stateWithPage,
      addSection({ type: 'testimonial', props: { quote: 'Hello', author: 'Bob' } })
    );
    expect(newState.page?.sections.length).toBe(3);
    expect(newState.page?.sections[2].type).toBe('testimonial');
    expect(newState.hasUnsavedChanges).toBe(true);
  });

  it('should remove a section', () => {
    const stateWithPage = draftPageReducer(undefined, initializePage({ page: mockPage }));
    const newState = draftPageReducer(stateWithPage, removeSection('s1'));
    expect(newState.page?.sections.length).toBe(1);
    expect(newState.page?.sections[0].id).toBe('s2');
  });

  it('should reorder sections', () => {
    const stateWithPage = draftPageReducer(undefined, initializePage({ page: mockPage }));
    const newState = draftPageReducer(stateWithPage, reorderSections({ fromIndex: 0, toIndex: 1 }));
    expect(newState.page?.sections[0].id).toBe('s2');
    expect(newState.page?.sections[1].id).toBe('s1');
  });

  it('should update section props', () => {
    const stateWithPage = draftPageReducer(undefined, initializePage({ page: mockPage }));
    const newState = draftPageReducer(
      stateWithPage,
      updateSectionProps({ id: 's1', props: { title: 'Updated Title', subtitle: 'New Subtitle' } })
    );
    expect(newState.page?.sections[0].props.title).toBe('Updated Title');
    expect(newState.page?.sections[0].props.subtitle).toBe('New Subtitle');
  });
});
