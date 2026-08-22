// API Client for HRMS Admin / HR Dashboard
// API Client for HRMS Employee Portal
const STORAGE_KEY_BACKEND = 'hrms_backend_url';
export const DEFAULT_BACKEND_URL = 'https://implant-constrain-grapple.ngrok-free.dev';

export function getBackendUrl() {
  return localStorage.getItem(STORAGE_KEY_BACKEND) || DEFAULT_BACKEND_URL;
}

export function setBackendUrl(url) {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_BACKEND);
  } else {
    localStorage.setItem(STORAGE_KEY_BACKEND, url.trim().replace(/\/+$/, ''));
  }
}

function getDefaultHeaders() {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
    'bypass-tunnel-reminder': 'true',
  };
}

async function handleResponse(response) {
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let message = `Request failed (${response.status})`;
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail.map(e => `${e.loc?.slice(-1)[0] || 'field'}: ${e.msg}`).join(', ');
      } else if (data.message) {
        message = data.message;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      message = data;
    }
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * 1. Admin Authentication
 * 1. Authentication
 */
export async function login(email, password) {
  const url = `${getBackendUrl()}/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function signup(email, password, role = 'admin') {
export async function signup(email, password, role = 'employee') {
  const url = `${getBackendUrl()}/signup`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ email, password, role }),
  });
  return handleResponse(res);
}

/**
 * 2. Organization-Wide Attendance Management
 */
export async function getAllAttendance() {
  const url = `${getBackendUrl()}/attendances`;
 * 2. Profile Management
 */
export async function getProfile(userId) {
  const url = `${getBackendUrl()}/profile/${parseInt(userId, 10)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse(res);
}

/**
 * 3. Organization-Wide Leave Approvals
 */
export async function getAllLeaves() {
  const url = `${getBackendUrl()}/leaves`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
export async function updateProfile(userId, profileData) {
  const url = `${getBackendUrl()}/profile/${parseInt(userId, 10)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: getDefaultHeaders(),
    body: JSON.stringify({
      full_name: profileData.full_name || null,
      phone: profileData.phone || null,
      address: profileData.address || null,
      job_title: profileData.job_title || null,
      department: profileData.department || null,
      profile_pic_url: profileData.profile_pic_url || null,
    }),
  });
  return handleResponse(res);
}

export async function approveLeave(leaveId, adminComment = null) {
  const url = `${getBackendUrl()}/leave/${parseInt(leaveId, 10)}/approve`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ admin_comment: adminComment || null }),
/**
 * 3. Attendance Management
 */
export async function checkIn(userId) {
  const url = `${getBackendUrl()}/attendance/check-in`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ user_id: parseInt(userId, 10) }),
  });
  return handleResponse(res);
}

export async function rejectLeave(leaveId, adminComment = null) {
  const url = `${getBackendUrl()}/leave/${parseInt(leaveId, 10)}/reject`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ admin_comment: adminComment || null }),
export async function checkOut(userId) {
  const url = `${getBackendUrl()}/attendance/check-out`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({ user_id: parseInt(userId, 10) }),
  });
  return handleResponse(res);
}

export async function actOnLeave(leaveId, action, adminComment = null) {
  if (action === 'approve') {
    return approveLeave(leaveId, adminComment);
  } else if (action === 'reject') {
    return rejectLeave(leaveId, adminComment);
  }
  throw new Error(`Unknown action: ${action}`);
}

/**
 * 4. Payroll Management
 */
export async function getAllPayroll() {
  const url = `${getBackendUrl()}/payrolls`;
export async function getMyAttendance(userId) {
  const url = `${getBackendUrl()}/attendance/${parseInt(userId, 10)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse(res);
}

export async function setPayroll({ user_id, basic_salary, allowances = 0.0, deductions = 0.0 }) {
  const url = `${getBackendUrl()}/payroll`;
/**
 * 4. Leave Management
 */
export async function applyLeave({ user_id, leave_type, start_date, end_date, remarks }) {
  const url = `${getBackendUrl()}/leave/apply`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify({
      user_id: parseInt(user_id, 10),
      basic_salary: parseFloat(basic_salary),
      allowances: parseFloat(allowances || 0),
      deductions: parseFloat(deductions || 0),
      leave_type,
      start_date,
      end_date,
      remarks: remarks || null,
    }),
  });
  return handleResponse(res);
}

/**
 * 5. Health check
export async function getMyLeaves(userId) {
  const url = `${getBackendUrl()}/leave/${parseInt(userId, 10)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse(res);
}

/**
 * 5. Payroll Management
 */
export async function getMyPayroll(userId) {
  const url = `${getBackendUrl()}/payroll/${parseInt(userId, 10)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse(res);
}

/**
 * 6. Health check
 */
export async function checkHealth() {
  try {
    const url = `${getBackendUrl()}/openapi.json`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
