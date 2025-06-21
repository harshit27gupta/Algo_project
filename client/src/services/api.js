import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to create authenticated axios instance
const createAuthInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

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

export const getAllProblems = async () => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.get('/problems');
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch problems. Please try again.'
    );
  }
};

export const getUserProblemStatus = async (problemId) => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.get(`/problems/${problemId}/status`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch problem status. Please try again.'
    );
  }
};

export const submitSolution = async (problemId, code, language) => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.post(`/problems/${problemId}/submit`, {
      code,
      language
    });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to submit solution. Please try again.'
    );
  }
};

// User Profile APIs
export const getUserProfile = async () => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.get('/user/profile');
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch user profile. Please try again.'
    );
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.patch('/user/profile', profileData);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to update profile. Please try again.'
    );
  }
};

export const getUserStats = async () => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.get('/user/stats');
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch user statistics. Please try again.'
    );
  }
};

export const getUserSubmissions = async (filters = {}) => {
  try {
    const authInstance = createAuthInstance();
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const res = await authInstance.get(`/user/submissions?${params.toString()}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch submissions. Please try again.'
    );
  }
};

export const getSolvedProblems = async (page = 1, limit = 10) => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.get(`/user/solved?page=${page}&limit=${limit}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch solved problems. Please try again.'
    );
  }
};

// Get single problem by ID
export const getProblem = async (problemId) => {
  try {
    const res = await axios.get(`${API_BASE}/problems/${problemId}`);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch problem. Please try again.'
    );
  }
};

export const runCode = async (problemId, code, language) => {
  try {
    const authInstance = createAuthInstance();
    const res = await authInstance.post(`/problems/${problemId}/run`, { code, language });
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to run code. Please try again.'
    );
  }
};