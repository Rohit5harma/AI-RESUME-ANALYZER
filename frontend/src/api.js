export const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000";

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    if (email) return { email, name: name || email.split("@")[0] };
  } catch (e) {
    console.error("Error reading current user:", e);
  }
  return null;
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("accessToken"));
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  window.location.href = "/login";
};

export const apiFetch = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");

  const makeRequest = async (token) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(accessToken);

  // Access token expired
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      logout();
      return response;
    }

    try {
      const refreshResponse = await fetch(
        `${API_BASE_URL}/api/token/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      );

      if (!refreshResponse.ok) {
        logout();
        return response;
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access;
      localStorage.setItem("accessToken", accessToken);

      // Retry original request with new token
      response = await makeRequest(accessToken);
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      return response;
    }
  }

  return response;
};

// API Service Functions
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response;
};

export const registerUser = async (name, email, password, confirmPassword) => {
  const response = await fetch(`${API_BASE_URL}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      confirm_password: confirmPassword,
    }),
  });
  return response;
};

export const fetchUserProfile = async () => {
  return apiFetch(`${API_BASE_URL}/profile/`);
};

export const updateUserProfile = async (profileData) => {
  return apiFetch(`${API_BASE_URL}/profile/update/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
};

export const uploadResumeFile = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return apiFetch(`${API_BASE_URL}/api/resume/upload/`, {
    method: "POST",
    body: formData,
  });
};

export const analyzeResumeId = async (resumeId) => {
  return apiFetch(`${API_BASE_URL}/api/analyze/${resumeId}/`, {
    method: "POST",
  });
};

export const fetchScanHistory = async () => {
  return apiFetch(`${API_BASE_URL}/api/history/`);
};

export const deleteResumeId = async (resumeId) => {
  return apiFetch(`${API_BASE_URL}/api/resume/${resumeId}/`, {
    method: "DELETE",
  });
};

export const saveJobDescription = async (jobTitle, company, description) => {
  return apiFetch(`${API_BASE_URL}/api/job-descriptions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_title: jobTitle,
      company,
      description,
    }),
  });
};

export const performAtsMatch = async (resumeId, jdId) => {
  return apiFetch(`${API_BASE_URL}/api/ats-match/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_id: resumeId,
      job_description_id: jdId,
    }),
  });
};

export const fetchAtsHistory = async () => {
  return apiFetch(`${API_BASE_URL}/api/ats-history/`);
};

export const fetchBulletEnhancerResumes = async () => {
  return apiFetch(`${API_BASE_URL}/api/bullet-enhancer/resumes/`);
};

export const enhanceBulletPointApi = async (resumeId, bullet, targetRole = "") => {
  return apiFetch(`${API_BASE_URL}/api/enhance-bullet/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_id: resumeId,
      bullet,
      target_role: targetRole,
    }),
  });
};

export const saveBulletEnhancementApi = async (payload) => {
  return apiFetch(`${API_BASE_URL}/api/bullet-enhancer/save/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const fetchBulletEnhancementHistory = async () => {
  return apiFetch(`${API_BASE_URL}/api/bullet-enhancer/history/`);
};
export const previewBulletReanalysisApi = async (payload) => {
  return apiFetch(`${API_BASE_URL}/api/bullet-enhancer/preview/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
