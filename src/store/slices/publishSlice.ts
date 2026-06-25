import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReleaseMetadata {
  version: string;
  changelog: string;
  timestamp: string;
}

interface PublishState {
  isPublishing: boolean;
  success: boolean;
  error: string | null;
  latestRelease: ReleaseMetadata | null;
}

const initialState: PublishState = {
  isPublishing: false,
  success: false,
  error: null,
  latestRelease: null,
};

export const publishSlice = createSlice({
  name: 'publish',
  initialState,
  reducers: {
    startPublishing: (state) => {
      state.isPublishing = true;
      state.success = false;
      state.error = null;
    },
    publishSuccess: (state, action: PayloadAction<ReleaseMetadata>) => {
      state.isPublishing = false;
      state.success = true;
      state.error = null;
      state.latestRelease = action.payload;
    },
    publishFailure: (state, action: PayloadAction<string>) => {
      state.isPublishing = false;
      state.success = false;
      state.error = action.payload;
    },
    clearPublishStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
});

export const { startPublishing, publishSuccess, publishFailure, clearPublishStatus } = publishSlice.actions;

export default publishSlice.reducer;
