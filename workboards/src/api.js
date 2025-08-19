import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 404) {
      console.warn('Resource not found:', error.config.url);
      return Promise.resolve({ data: [] });
    }
    if (error.response && error.response.status === 500) {
      console.error('Internal Server Error:', error.config.url);
      return Promise.reject(new Error('An unexpected server error occurred. Please try again later.'));
    }
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  try {
    const response = await api.post('/login/', { username, password });
    if (response.data && response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/logout/');
  } catch (error) {
    console.error('Logout error:', error.response ? error.response.data : error.message);
  } finally {
    setAuthToken(null);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 500) {
      throw new Error('An unexpected server error occurred while fetching user data. Please try again later.');
    }
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/users/');
    return response.data;
  } catch (error) {
    console.error('Error getting users:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getBoard = async (id) => {
  try {
    console.log(`Fetching board with id: ${id}`);
    const response = await api.get(`/boards/${id}/`);
    console.log('Board data received:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting board ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getTasks = async (boardId) => {
  try {
    console.log(`Fetching tasks for board: ${boardId}`);
    const response = await api.get(`/tasks/?board=${boardId}`);
    console.log('Tasks data received:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting tasks for board ${boardId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createBoard = async (boardData) => {
  try {
    console.log('Creating board with data:', boardData);
    const response = await api.post('/boards/', boardData);
    console.log('Board created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating board:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createTask = async (boardId, taskData) => {
  try {
    console.log(`Creating task for board ${boardId}:`, taskData);
    const payload = {
      ...taskData,
      board: boardId,
      assignee_id: taskData.assignee ? parseInt(taskData.assignee, 10) : null
    };
    console.log('Sending task payload:', payload);
    const response = await api.post(`/tasks/`, payload);
    console.log('Task created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    console.log(`Updating task ${taskId}:`, taskData);
    const payload = {
      ...taskData,
      assignee_id: taskData.assignee_id ? parseInt(taskData.assignee_id, 10) : null,
      board: taskData.board
    };
    console.log('Sending task update payload:', payload);
    const response = await api.put(`/tasks/${taskId}/`, payload);
    console.log('Task updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getBoards = async () => {
  try {
    console.log('Fetching all boards');
    const response = await api.get('/boards/');
    console.log('Boards data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting boards:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateBoard = async (id, boardData) => {
  try {
    console.log(`Updating board ${id}:`, boardData);
    const response = await api.put(`/boards/${id}/`, boardData);
    console.log('Board updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating board:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteBoard = async (boardId) => {
  try {
    console.log(`Deleting board ${boardId}`);
    await api.delete(`/boards/${boardId}/`);
    console.log('Board deleted successfully');
  } catch (error) {
    console.error('Error deleting board:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    console.log(`Deleting task ${taskId}`);
    await api.delete(`/tasks/${taskId}/`);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getUserAssignments = async (userId) => {
  try {
    console.log(`Fetching assignments for user: ${userId}`);
    const response = await api.get(`/users/${userId}/assignments/`);
    console.log('User assignments received:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting assignments for user ${userId}:`, error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 404) {
      console.warn('Assignments endpoint not found. Falling back to getAssignedTasks.');
      return getAssignedTasks(userId);
    }
    throw error;
  }
};

export const getAssignedBoards = async (userId) => {
  try {
    console.log(`Fetching assigned boards for user: ${userId}`);
    const response = await api.get(`/users/${userId}/assigned-boards/`);
    console.log('Assigned boards received:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting assigned boards for user ${userId}:`, error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 404) {
      console.warn('Assigned boards endpoint not found. Falling back to getAssignedBoardsFromTasks.');
      return getAssignedBoardsFromTasks(userId);
    }
    throw error;
  }
};

const getAssignedTasks = async (userId) => {
  try {
    console.log(`Fetching assigned tasks for user: ${userId}`);
    const response = await api.get(`/tasks/?assignee=${userId}`);
    console.log('Assigned tasks received:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting assigned tasks for user ${userId}:`, error.response ? error.response.data : error.message);
    return [];
  }
};

const getAssignedBoardsFromTasks = async (userId) => {
  try {
    const tasks = await getAssignedTasks(userId);
    const boardIds = [...new Set(tasks.map(task => task.board))];
    const boards = await Promise.all(boardIds.map(id => getBoard(id)));
    return boards;
  } catch (error) {
    console.error(`Error getting assigned boards from tasks for user ${userId}:`, error.response ? error.response.data : error.message);
    return [];
  }
};

const storedToken = localStorage.getItem('token');
if (storedToken) {
  setAuthToken(storedToken);
}

export default api;