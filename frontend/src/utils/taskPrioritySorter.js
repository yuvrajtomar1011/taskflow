export const sortTasks = (tasks) => {
  if (!Array.isArray(tasks)) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const getPriorityScore = (p) => {
    const priority = (p || '').toLowerCase();
    if (priority === 'high') return 3;
    if (priority === 'medium') return 2;
    if (priority === 'low') return 1;
    return 0;
  };

  return [...tasks].sort((a, b) => {
    const completedA = !!a.completed;
    const completedB = !!b.completed;
    
    // 4. Completed tasks always last
    if (completedA !== completedB) {
      return completedA ? 1 : -1;
    }

    const dateA = a.due_date ? new Date(a.due_date) : null;
    const dateB = b.due_date ? new Date(b.due_date) : null;

    // 1. Overdue tasks first (if not completed)
    const isOverdueA = !completedA && dateA && dateA < now;
    const isOverdueB = !completedB && dateB && dateB < now;

    if (isOverdueA !== isOverdueB) {
      return isOverdueA ? -1 : 1;
    }

    // 2. Priority: High > Medium > Low
    const scoreA = getPriorityScore(a.priority);
    const scoreB = getPriorityScore(b.priority);
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // 3. Earlier due date before later
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    if (dateA && dateB) {
      return dateA - dateB;
    }

    return 0;
  });
};