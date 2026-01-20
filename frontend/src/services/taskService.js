import api from "./api";

// Get all tasks
export const getTasks = async () => {
  const response = await api.get("/tasks/");
  return response.data.results || response.data;
};

// Create a task
export const createTask = async (taskData) => {
  const response = await api.post("/tasks/", taskData);
  return response.data;
};

// Update a task
export const updateTask = async (id, data) => {
  const response = await api.patch(`/tasks/${id}/`, data);
  return response.data;
};

// Delete a task
export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}/`);
};
