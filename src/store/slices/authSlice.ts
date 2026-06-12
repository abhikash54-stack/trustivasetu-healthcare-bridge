import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state: AuthState, action: PayloadAction<{ token: string; user: UserProfile }>) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    signOut(state: AuthState) {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
