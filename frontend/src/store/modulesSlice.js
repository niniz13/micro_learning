import { createSlice } from '@reduxjs/toolkit';

const modulesSlice = createSlice({
  name: 'modules',
  initialState: {
    modules: [],
    progression: 0,
    completedModules: [],
  },
  reducers: {
    setModules: (state, action) => {
      state.modules = action.payload;
    },
    setProgression: (state, action) => {
      state.progression = action.payload;
    },
    setCompletedModules: (state, action) => {
      state.completedModules = action.payload;
    },
  },
});

export const { setModules, setProgression, setCompletedModules } = modulesSlice.actions;
export default modulesSlice.reducer;
