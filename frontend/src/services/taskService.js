import api from './api';

export const getTasks = async () => {
  try {
    const response = await api.get('/tasks/');
    
    // Handle Django REST Framework Paginated Response
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    // Handle Standard Array Response
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Return empty array if format is unexpected to prevent UI crashes
    return [];
  } catch (error) {
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await api.patch(`/tasks/${id}/`, taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};