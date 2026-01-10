import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

<button onClick={logout}>Logout</button>

function Tasks() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await fetchTasks();
    setTasks(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;

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
    <div>
      <h2>My Tasks</h2>

      <form onSubmit={handleCreate}>
        <input
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button>Add</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span
              style={{
                textDecoration: task.is_completed
                  ? "line-through"
                  : "none",
                cursor: "pointer",
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
