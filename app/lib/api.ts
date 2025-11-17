const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://todo-app.pioneeralpha.com/api';

export interface LoginResponse {
  refresh: string;
  access: string;
}

export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  contact_number: string;
  birthday: string | null;
  profile_image: string | null;
  bio: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  priority: string;
  is_completed: boolean;
  position: number;
  todo_date: string;
  created_at: string;
  updated_at: string;
}

const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

const handleAuthError = () => {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const accessToken = getAccessToken();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/users/signup')) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: headers as HeadersInit,
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
      throw new Error('Authentication failed');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || 'Request failed');
  }

  return response.json();
};

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    return apiRequest<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: formData,
    });
  },

  signup: async (
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('email', email);
    formData.append('password', password);

    return apiRequest('/users/signup/', {
      method: 'POST',
      body: formData,
    });
  },
};

export const userAPI = {
  getCurrentUser: async (): Promise<UserData> => {
    return apiRequest<UserData>('/users/me/');
  },

  updateUser: async (userData: {
    first_name?: string;
    last_name?: string;
    address?: string;
    contact_number?: string;
    birthday?: string;
    bio?: string;
    profile_image?: File;
  }): Promise<UserData> => {
    const formData = new FormData();
    
    if (userData.first_name) formData.append('first_name', userData.first_name);
    if (userData.last_name) formData.append('last_name', userData.last_name);
    if (userData.address) formData.append('address', userData.address);
    if (userData.contact_number) formData.append('contact_number', userData.contact_number);
    if (userData.birthday) formData.append('birthday', userData.birthday);
    if (userData.bio) formData.append('bio', userData.bio);
    if (userData.profile_image) formData.append('profile_image', userData.profile_image);

    return apiRequest<UserData>('/users/me/', {
      method: 'PATCH',
      body: formData,
    });
  },
};

export const todoAPI = {
  getTodos: async (params?: {
    search?: string;
    todo_date?: string;
    priority?: string;
    is_completed?: boolean;
  }): Promise<Todo[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.todo_date) queryParams.append('todo_date', params.todo_date);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.is_completed !== undefined) queryParams.append('is_completed', String(params.is_completed));

    const queryString = queryParams.toString();
    const endpoint = `/todos/${queryString ? `?${queryString}` : ''}`;
    
    const data = await apiRequest<Todo[] | { results: Todo[]; todos: Todo[] }>(endpoint);
    
    if (Array.isArray(data)) {
      return data;
    }
    return data.results || data.todos || [];
  },

  createTodo: async (todoData: {
    title: string;
    description: string;
    priority: string;
    todo_date: string;
  }): Promise<Todo> => {
    const formData = new FormData();
    formData.append('title', todoData.title);
    formData.append('description', todoData.description);
    formData.append('priority', todoData.priority);
    formData.append('todo_date', todoData.todo_date);

    return apiRequest<Todo>('/todos/', {
      method: 'POST',
      body: formData,
    });
  },

  updateTodo: async (
    todoId: string,
    todoData: {
      title?: string;
      description?: string;
      priority?: string;
      todo_date?: string;
      position?: number;
    }
  ): Promise<Todo> => {
    const formData = new FormData();
    
    if (todoData.title) formData.append('title', todoData.title);
    if (todoData.description) formData.append('description', todoData.description);
    if (todoData.priority) formData.append('priority', todoData.priority);
    if (todoData.todo_date) formData.append('todo_date', todoData.todo_date);
    if (todoData.position !== undefined) formData.append('position', String(todoData.position));

    return apiRequest<Todo>(`/todos/${todoId}/`, {
      method: 'PATCH',
      body: formData,
    });
  },

  deleteTodo: async (todoId: string): Promise<void> => {
    await apiRequest(`/todos/${todoId}/`, {
      method: 'DELETE',
    });
  },
};

