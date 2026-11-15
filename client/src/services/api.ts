const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('attendance_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { login: string; password: string; rememberMe?: boolean }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  getMe: () => request<{ user: any }>('/auth/me'),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getStudents: (params?: { departmentId?: string; semester?: string; search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ students: any[] }>(`/admin/students?${qs}`);
  },
  createStudent: (data: any) =>
    request<{ message: string; student: any }>('/admin/students', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateStudent: (id: string, data: any) =>
    request<{ message: string }>(`/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteStudent: (id: string) =>
    request<{ message: string }>(`/admin/students/${id}`, {
      method: 'DELETE'
    }),
  getStudentAttendanceHistory: (id: string) =>
    request<any>(`/admin/students/${id}/attendance`),

  getFacultyList: () => request<{ faculty: any[] }>('/admin/faculty'),
  createFaculty: (data: any) =>
    request<{ message: string; faculty: any }>('/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateFaculty: (id: string, data: any) =>
    request<{ message: string }>(`/admin/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteFaculty: (id: string) =>
    request<{ message: string }>(`/admin/faculty/${id}`, {
      method: 'DELETE'
    }),

  getDepartments: () => request<{ departments: any[] }>('/admin/departments'),
  createDepartment: (data: any) =>
    request<{ message: string; department: any }>('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateDepartment: (id: string, data: any) =>
    request<{ message: string; department: any }>(`/admin/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteDepartment: (id: string) =>
    request<{ message: string }>(`/admin/departments/${id}`, {
      method: 'DELETE'
    }),

  getCourses: () => request<{ courses: any[] }>('/admin/courses'),
  createCourse: (data: any) =>
    request<{ message: string; course: any }>('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCourse: (id: string, data: any) =>
    request<{ message: string; course: any }>(`/admin/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteCourse: (id: string) =>
    request<{ message: string }>(`/admin/courses/${id}`, {
      method: 'DELETE'
    }),

  getClasses: () => request<{ classes: any[] }>('/admin/classes'),
  createClass: (data: any) =>
    request<{ message: string; class: any }>('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateClass: (id: string, data: any) =>
    request<{ message: string; class: any }>(`/admin/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteClass: (id: string) =>
    request<{ message: string }>(`/admin/classes/${id}`, {
      method: 'DELETE'
    }),

  getSettings: () => request<{ settings: Record<string, string>; raw: any[] }>('/admin/settings'),
  updateSettings: (settings: Record<string, string>) =>
    request<{ message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Faculty
  getFacultyDashboard: (facultyId?: string) =>
    request<any>(`/faculty/dashboard${facultyId ? `?facultyId=${facultyId}` : ''}`),
  getFacultyClasses: (facultyId?: string) =>
    request<{ classes: any[] }>(`/faculty/classes${facultyId ? `?facultyId=${facultyId}` : ''}`),
  getClassStudents: (classId: string, date?: string) =>
    request<any>(`/faculty/classes/${classId}/students${date ? `?date=${date}` : ''}`),
  markAttendance: (data: any) =>
    request<any>('/faculty/mark-attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAttendanceRecord: (data: { recordId: string; newStatus: string; remarks?: string }) =>
    request<any>('/faculty/update-record', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  getFacultyHistory: (facultyId?: string) =>
    request<{ history: any[] }>(`/faculty/history${facultyId ? `?facultyId=${facultyId}` : ''}`),
  getClassReport: (classId: string) =>
    request<any>(`/faculty/class-report/${classId}`),

  // Student
  getStudentDashboard: (studentId?: string) =>
    request<any>(`/student/dashboard${studentId ? `?studentId=${studentId}` : ''}`),
  getStudentCalendar: (studentId?: string) =>
    request<{ calendar: any[] }>(`/student/calendar${studentId ? `?studentId=${studentId}` : ''}`),
  getStudentHistory: (params?: { studentId?: string; status?: string; subjectId?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ history: any[] }>(`/student/history?${qs}`);
  },

  // Attendance Reports
  getReports: (params: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<any>(`/attendance/reports?${qs}`);
  },

  // Database Management & Architecture Center
  getDatabaseOverview: () => request<any>('/database/overview'),
  getRelationalSchema: () => request<any>('/database/relational/schema'),
  getNoSqlDocuments: (collection: string, limit = 25) =>
    request<any>(`/database/nosql/documents?collection=${collection}&limit=${limit}`),
  getGraphData: (limit = 100) => request<any>(`/database/graph/data?limit=${limit}`),
  getNodeNeighbors: (nodeId: string) => request<any>(`/database/graph/node/${nodeId}`),
  executeCypher: (query: string) =>
    request<any>('/database/graph/cypher', {
      method: 'POST',
      body: JSON.stringify({ query })
    }),
  getCacheStats: () => request<any>('/database/cache/stats'),
  clearCache: () => request<any>('/database/cache/clear', { method: 'POST' }),
  simulateTransaction: (mode: 'success' | 'fail_duplicate') =>
    request<any>('/database/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify({ mode })
    }),
  getCloudGuide: () => request<any>('/database/cloud-guide'),

  // Notifications
  getNotifications: () => request<{ unreadCount: number; notifications: any[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<any>('/notifications/mark-all-read', { method: 'PUT' }),
  publishNotification: (data: any) =>
    request<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};
