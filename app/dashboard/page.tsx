'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, Search, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import FilterDropdown from '../components/FilterDropdown';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Extreme' | 'Moderate' | 'Low';
  dueDate: string;
}

interface UserData {
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

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = currentDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const mapPriority = (priority: string): 'Extreme' | 'Moderate' | 'Low' => {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority.includes('extreme') || lowerPriority.includes('high')) {
      return 'Extreme';
    }
    if (lowerPriority.includes('moderate') || lowerPriority.includes('medium')) {
      return 'Moderate';
    }
    return 'Low';
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('https://todo-app.pioneeralpha.com/api/users/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data: UserData = await response.json();
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const getDateFilterValue = (filterId: string): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterId) {
      case 'today':
        return formatDateForAPI(today);
      case '5days': {
        const date = new Date(today);
        date.setDate(date.getDate() + 5);
        return formatDateForAPI(date);
      }
      case '10days': {
        const date = new Date(today);
        date.setDate(date.getDate() + 10);
        return formatDateForAPI(date);
      }
      case '30days': {
        const date = new Date(today);
        date.setDate(date.getDate() + 30);
        return formatDateForAPI(date);
      }
      default:
        return null;
    }
  };

  const fetchTodos = async (search?: string, filters?: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();

      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const activeFilters = filters || selectedFilters;
      if (activeFilters.length > 0) {
        const firstFilter = activeFilters[0];
        const dateValue = getDateFilterValue(firstFilter);
        if (dateValue) {
          params.append('todo_date', dateValue);
        }
      }

      const queryString = params.toString();
      const url = `https://todo-app.pioneeralpha.com/api/todos/${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch todos');
      }

      const data = await response.json();
      
      const todosArray = Array.isArray(data) ? data : (data.results || data.todos || []);
      
      const mappedTasks: Task[] = todosArray.map((todo: any) => ({
        id: todo.id?.toString() || todo.pk?.toString() || Math.random().toString(),
        title: todo.title || todo.name || 'Untitled Task',
        description: todo.description || todo.desc || '',
        priority: mapPriority(todo.priority || todo.priority_level || 'low'),
        dueDate: todo.todo_date ? formatDate(todo.todo_date) : (todo.todo_date || 'No due date'),
      }));

      setTasks(mappedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching todos');
      console.error('Error fetching todos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    fetchUserData();
    fetchTodos();
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTodos(searchQuery, selectedFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilters]);

  const handleEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setSelectedTask(task);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch(`https://todo-app.pioneeralpha.com/api/todos/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to delete task');
      }

      await fetchTodos(searchQuery, selectedFilters);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: {
    title: string;
    description: string;
    priority: string;
    todo_date: string;
  }) => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!accessToken) {
      router.push('/login');
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('title', taskData.title);
    formData.append('description', taskData.description);
    formData.append('priority', taskData.priority);
    formData.append('todo_date', taskData.todo_date);

    const response = await fetch(`https://todo-app.pioneeralpha.com/api/todos/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        router.push('/login');
        throw new Error('Authentication failed');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to update task');
    }

    await fetchTodos(searchQuery, selectedFilters);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleNewTask = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: string;
    todo_date: string;
  }) => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!accessToken) {
      router.push('/login');
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('title', taskData.title);
    formData.append('description', taskData.description);
    formData.append('priority', taskData.priority);
    formData.append('todo_date', taskData.todo_date);

    const response = await fetch('https://todo-app.pioneeralpha.com/api/todos/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        router.push('/login');
        throw new Error('Authentication failed');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to create task');
    }

    await fetchTodos(searchQuery, selectedFilters);
  };

  const handleSearch = () => {
    fetchTodos(searchQuery, selectedFilters);
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getUserDisplayName = () => {
    if (userData) {
      const firstName = userData.first_name || '';
      const lastName = userData.last_name || '';
      return `${firstName} ${lastName}`.trim() || userData.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar
        userName={getUserDisplayName()}
        userEmail={userData?.email || ''}
        userAvatar={userData?.profile_image || undefined}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">DREAMY SOFTWARE</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{dayName}</span>
                <span className="ml-2">{dateString}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Todos
                </h2>
                <div className="h-1 w-20 bg-blue-600 rounded"></div>
              </div>
              <Button
                onClick={handleNewTask}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Task
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search your task here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                <Search className="w-5 h-5" />
              </button>
              <FilterDropdown
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Tasks</h3>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={() => fetchTodos(searchQuery)}
                    className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">Loading todos...</p>
                </div>
              ) : tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      description={task.description}
                      priority={task.priority}
                      dueDate={task.dueDate}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    {searchQuery ? 'No tasks found matching your search.' : 'No tasks yet. Create your first task!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateTask}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={selectedTask}
        onSubmit={handleUpdateTask}
        onDelete={handleDelete}
      />
    </div>
  );
}

