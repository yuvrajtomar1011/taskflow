export const getAttentionRequired = (tasks) => {
  if (!Array.isArray(tasks)) return { count: 0, tasks: [] };

  const now = new Date();
  // Normalize "now" to start of today for accurate overdue comparison
  now.setHours(0, 0, 0, 0);

  const urgentTasks = tasks.filter(task => {
    // 1. Not completed
    if (task.completed) return false;

    // 2. High Priority
    const priority = (task.priority || '').toLowerCase();
    if (priority !== 'high') return false;

    // 3. Overdue
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    
    // Compare dates
    return taskDate < now;
  });

  return {
    count: urgentTasks.length,
    tasks: urgentTasks
  };
};