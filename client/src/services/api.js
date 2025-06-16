import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

export const registerUser = async (formData) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, formData);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Registration failed. Please try again.'
    );
  }
};

export const loginUser = async (formData) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, formData);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Login failed. Please try again.'
    );
  }
};

export const googleLogin = async (credential) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/google`, { credential });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Google login failed. Please try again.'
    );
  }
}; 