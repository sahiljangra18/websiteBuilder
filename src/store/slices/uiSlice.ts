import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'viewer' | 'editor' | 'publisher';

interface UIState {
  selectedSectionId: string | null;
  userRole: UserRole;
  previewDevice: 'desktop' | 'mobile';
  sidebarOpen: boolean;
}

const initialState: UIState = {
  selectedSectionId: null,
  userRole: 'editor',
  previewDevice: 'desktop',
  sidebarOpen: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectSection: (state, action: PayloadAction<string | null>) => {
      state.selectedSectionId = action.payload;
    },
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.userRole = action.payload;
      if (typeof window !== 'undefined') {
        // Set cookie for middleware/server side verification
        document.cookie = `user-role=${action.payload}; path=/; max-age=31536000`;
      }
    },
    setPreviewDevice: (state, action: PayloadAction<'desktop' | 'mobile'>) => {
      state.previewDevice = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { selectSection, setUserRole, setPreviewDevice, toggleSidebar } = uiSlice.actions;

export default uiSlice.reducer;
