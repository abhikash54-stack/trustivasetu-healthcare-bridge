import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state: AuthState, action: PayloadAction<{ user: UserProfile }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    updateUser(state: AuthState, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    signOut(state: AuthState) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { signIn, signOut, updateUser } = authSlice.actions;
export default authSlice.reducer;
