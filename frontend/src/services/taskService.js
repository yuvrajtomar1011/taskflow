import api from "./api";

export const fetchTasks = async () => {
  const res = await api.get("/tasks/");
  return res.data.results || res.data;
};

export const createTask = async (task) => {
  const res = await api.post("/tasks/", task);
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await api.patch(`/tasks/${id}/`, data);
  return res.data;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}/`);
};
