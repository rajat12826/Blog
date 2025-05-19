import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { axiosServices } from "../auth";
import { log } from "console";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  mode:boolean|true
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  mode:true
};


// Async thunk to login using axios
export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await axiosServices.post("auth/signin", credentials);
      // Expecting res.data = { user, token }
      console.log(res);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", res.data.token);
      console.log(res);
      
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/getUser",
  async (_: null, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = localStorage.getItem("token");

console.log(token);

      

      const res = await axiosServices.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
console.log(res.data);

      return res.data.user; // assuming response is { user: {...} }
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);
// Async thunk to get current user from /api/auth/me using axios

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("user");
    },
    toggleMode(state) {
      state.mode = !state.mode;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state,action) => {
        console.log(action.payload);
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload.user);
        
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     
  
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        console.log(action.payload);
        
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null; // token invalid, clear it
        state.error = action.payload as string;
      });
  },
});

export const { logout,toggleMode } = authSlice.actions;

export default authSlice.reducer;
