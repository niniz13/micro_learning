import { configureStore } from '@reduxjs/toolkit';
import modulesReducer from './modulesSlice';

export const store = configureStore({
  reducer: {
    modules: modulesReducer,
  },
});

export default store;
