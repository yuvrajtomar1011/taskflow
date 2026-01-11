import { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import "../styles/tasks.css";

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
    <main className="container">
      <header className="header">
        <h1>TaskFlow</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <form className="task-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Enter new task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li className="task-item" key={task.id}>
            <span
              className={`task-title ${
                task.is_completed ? "completed" : ""
              }`}
              onClick={() => toggleComplete(task)}
            >
              {task.title}
            </span>
            <button
              className="delete-btn"
              onClick={() => handleDelete(task.id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default Tasks;


