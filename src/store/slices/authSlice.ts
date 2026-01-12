import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  authModalMode: 'signin' | 'signup';
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  showAuthModal: false,
  authModalMode: 'signin',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    openAuthModal: (state, action: PayloadAction<'signin' | 'signup'>) => {
      state.showAuthModal = true;
      state.authModalMode = action.payload;
    },
    closeAuthModal: (state) => {
      state.showAuthModal = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setLoading, openAuthModal, closeAuthModal, logout } = authSlice.actions;
export default authSlice.reducer;
