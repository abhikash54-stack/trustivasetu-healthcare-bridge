import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(
      state: AuthState,
      action: PayloadAction<{ token: string; refreshToken: string; user: UserProfile }>,
    ) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    updateUser(state: AuthState, action: PayloadAction<Partial<UserProfile>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    signOut(state: AuthState) {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
});

export const { signIn, signOut, updateUser } = authSlice.actions;
export default authSlice.reducer;
