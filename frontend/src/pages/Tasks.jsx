import { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import { useAuth } from "../context/AuthContext";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await fetchTasks();
    setTasks(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = await createTask({ title });
    setTasks([newTask, ...tasks]);
    setTitle("");
  };

  const toggleComplete = async (task) => {
    const updated = await updateTask(task.id, {
      is_completed: !task.is_completed,
    });

    setTasks(
      tasks.map((t) => (t.id === task.id ? updated : t))
    );
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>TaskFlow</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Create Task */}
      <form
        onSubmit={handleCreate}
        style={{ marginTop: "20px", display: "flex" }}
      >
        <input
          type="text"
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, marginRight: "10px" }}
        />
        <button type="submit">Add</button>
      </form>

      {/* Task List */}
      <ul style={{ marginTop: "20px", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              listStyle: "none",
            }}
          >
            <span
              style={{
                cursor: "pointer",
                textDecoration: task.is_completed
                  ? "line-through"
                  : "none",
              }}
              onClick={() => toggleComplete(task)}
            >
              {task.title}
            </span>

            <button onClick={() => handleDelete(task.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;

