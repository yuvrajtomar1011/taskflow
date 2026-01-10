import { useEffect, useState } from "react";
import { fetchTasks } from "../services/taskService";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks().then((data) => {
      setTasks(data.results || data);
    });
  }, []);

  return (
    <div>
      <h2>My Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;
