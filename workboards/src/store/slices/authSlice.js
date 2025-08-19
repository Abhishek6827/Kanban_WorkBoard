import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as apiLogin, logout as apiLogout, getCurrentUser, setAuthToken } from '../../api';

export const initAuth = createAsyncThunk('auth/initAuth', async () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
    return await getCurrentUser();
  }
  return null;
});

export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    const data = await apiLogin(username, password);
    if (data.token) {
      setAuthToken(data.token);
      localStorage.setItem('token', data.token);
      return await getCurrentUser();
    }
    return rejectWithValue('Login failed');
  } catch (error) {
    return rejectWithValue('Login failed. Please check your credentials.');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await apiLogout();
  } catch (error) {
    console.error('Logout failed:', error);
  }
  setAuthToken(null);
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.loading = false;
        state.error = 'Failed to authenticate. Please log in again.';
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export default authSlice.reducer;