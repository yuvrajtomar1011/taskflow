import { useEffect, useState } from "react";
import { getTasks, createTask } from "../services/taskService";
import "../styles/tasks.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const newTask = {
        title: title,
        due_date: dueDate || null,
        priority: priority,
      };

      const createdTask = await createTask(newTask);
      setTasks([createdTask, ...tasks]);

      setTitle("");
      setDueDate("");
      setPriority("medium");
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading tasks...</p>;
  }

  return (
    <main className="container">
      <h2>My Tasks</h2>

      <form className="task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit">Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="task-item">
            <h3>{task.title}</h3>

            <div className="task-meta">
              {task.due_date && <small>Due: {task.due_date}</small>}
              <small>Priority: {task.priority}</small>
            </div>
          </div>
        ))
      )}
    </main>
  );
}

export default Tasks;
