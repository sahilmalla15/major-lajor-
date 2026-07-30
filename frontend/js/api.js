/**
 * Atelier — API Client
 * Centralized HTTP client for all API calls to the Django backend
 */

const API = (() => {
  const BASE_URL = 'http://127.0.0.1:8000/api';

  function getToken() {
    return localStorage.getItem('access_token');
  }

  function getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  function setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  }

  function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  function isAuthenticated() {
    return !!getToken();
  }

  async function refreshToken() {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');

    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
      clearTokens();
      window.location.href = 'login.html';
      throw new Error('Session expired');
    }

    const data = await res.json();
    setTokens(data.access);
    return data.access;
  }

  async function request(method, path, body = null, isFormData = false) {
    const url = `${BASE_URL}${path}`;
    const headers = {};

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const opts = { method, headers };
    if (body) {
      opts.body = isFormData ? body : JSON.stringify(body);
    }

    let res = await fetch(url, opts);

    // If 401, try refreshing token once
    if (res.status === 401 && getRefreshToken()) {
      try {
        const newToken = await refreshToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, { method, headers, body: opts.body });
      } catch {
        clearTokens();
        window.location.href = 'login.html';
        throw new Error('Session expired');
      }
    }

    // Handle 204 No Content
    if (res.status === 204) return null;

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.detail || data.message || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  return {
    // Auth
    login: (username, password) =>
      request('POST', '/auth/login/', { username, password }),

    register: (data) =>
      request('POST', '/auth/register/', data),

    getProfile: () =>
      request('GET', '/auth/profile/'),

    updateProfile: (data) =>
      request('PUT', '/auth/profile/', data),

    // Learning
    getModules: () =>
      request('GET', '/learning/modules/'),

    getModuleDetail: (id) =>
      request('GET', `/learning/modules/${id}/`),

    getLesson: (id) =>
      request('GET', `/learning/lessons/${id}/`),

    getExercises: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/learning/exercises/${qs ? '?' + qs : ''}`);
    },

    getAnimation: (id) =>
      request('GET', `/learning/exercises/${id}/animation/`),

    submitDrawing: (exerciseId, formData) =>
      request('POST', `/learning/exercises/${exerciseId}/submit-drawing/`, formData, true),

    getSubmissions: () =>
      request('GET', '/learning/submissions/'),

    getRoadmap: () =>
      request('GET', '/learning/roadmap/'),

    generateRoadmap: (data) =>
      request('POST', '/learning/roadmap/generate/', data),

    updateRoadmapItem: (id, data) =>
      request('PUT', `/learning/roadmap/item/${id}/`, data),

    // Mentor
    getSessions: () =>
      request('GET', '/mentor/sessions/'),

    createSession: (data = {}) =>
      request('POST', '/mentor/sessions/', data),

    getSessionMessages: (id) =>
      request('GET', `/mentor/sessions/${id}/`),

    sendMessage: (sessionId, content) =>
      request('POST', `/mentor/sessions/${sessionId}/chat/`, { message: content }),

    evaluateSketch: (formData) =>
      request('POST', '/mentor/evaluate-sketch/', formData, true),

    getEvaluations: () =>
      request('GET', '/mentor/evaluations/'),

    // Progress
    getStats: () =>
      request('GET', '/progress/stats/'),

    getActivity: () =>
      request('GET', '/progress/activity/'),

    recordActivity: (data) =>
      request('POST', '/progress/activity/record/', data),

    getAchievements: () =>
      request('GET', '/progress/achievements/'),

    getDashboard: () =>
      request('GET', '/progress/dashboard/'),

    // Knowledge Base
    getCategories: () =>
      request('GET', '/knowledge-base/categories/'),

    getResources: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/knowledge-base/resources/${qs ? '?' + qs : ''}`);
    },

    getResource: (id) =>
      request('GET', `/knowledge-base/resources/${id}/`),

    // Helpers
    isAuthenticated,
    getToken,
    clearTokens,
    setTokens,
  };
})();