import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import api from '../services/api';
import { sortTasks } from '../utils/taskPrioritySorter';
import { getAttentionRequired } from '../utils/attentionRequired';

const Tasks = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI State
  const [activeMenuTaskId, setActiveMenuTaskId] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('All');

  // Constants
  const FOLDERS = ['General', 'Work', 'Personal', 'Urgent'];

  // Form State
  const [createFormData, setCreateFormData] = useState({
    title: '',
    due_date: '',
    priority: 'medium',
    folder: 'General'
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    due_date: '',
    priority: 'medium',
    folder: 'General'
  });

  // --- Effect 1: Handle Auth Headers & Redirects ---
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token, navigate]);

  // --- Effect 2: Fetch Tasks ---
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        const data = await getTasks();
        if (isMounted) {
          const list = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
          setTasks(list);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fetch Error:", err);
          if (err.response && err.response.status === 401) {
            logout();
          } else {
            setError('Failed to load tasks.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllTasks();

    return () => { isMounted = false; };
  }, [token, logout]);

  // --- Effect 3: Click Outside Listener ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.task-menu-wrapper')) {
        setActiveMenuTaskId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Helpers ---
  const parseTask = (task) => {
    const title = task.title || '';
    const match = title.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && FOLDERS.includes(match[1])) {
      return { ...task, cleanTitle: match[2], folder: match[1] };
    }
    return { ...task, cleanTitle: title, folder: 'General' };
  };

  const formatTitleForSave = (cleanTitle, folder) => {
    if (folder === 'General') return cleanTitle;
    return `[${folder}] ${cleanTitle}`;
  };

  // --- Handlers ---
  const handleInputChange = (e, setForm) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!createFormData.title.trim()) { setError('Title required'); return; }

    const finalTitle = formatTitleForSave(createFormData.title, createFormData.folder);
    
    const payload = {
      title: finalTitle,
      due_date: createFormData.due_date ? createFormData.due_date : null,
      priority: createFormData.priority.toLowerCase()
    };

    try {
      const newTask = await createTask(payload);
      setTasks(prev => [...prev, newTask]);
      setCreateFormData({ title: '', due_date: '', priority: 'medium', folder: 'General' });
    } catch (err) {
      console.error("Add Task Error:", err);
      if (err.response?.status === 401) {
        logout();
      } else {
        const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Check input data.';
        setError(`Failed to add task: ${serverMsg}`);
      }
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const finalTitle = formatTitleForSave(editFormData.title, editFormData.folder);
    
    const payload = {
      title: finalTitle,
      due_date: editFormData.due_date ? editFormData.due_date : null,
      priority: editFormData.priority.toLowerCase()
    };

    try {
      const updated = await updateTask(editingTaskId, payload);
      setTasks(prev => prev.map(t => (t.id || t._id) === editingTaskId ? updated : t));
      setEditingTaskId(null);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Failed to update task.');
      }
    }
  };

  const handleToggleComplete = async (task) => {
    const parsed = parseTask(task);
    const finalTitle = formatTitleForSave(parsed.cleanTitle, parsed.folder);
    
    const payload = {
      title: finalTitle,
      due_date: task.due_date,
      priority: task.priority,
      completed: !task.completed
    };

    try {
      const updated = await updateTask(task.id || task._id, payload);
      setTasks(prev => prev.map(t => (t.id || t._id) === (task.id || task._id) ? updated : t));
    } catch (err) {
      console.error("Complete Toggle Error:", err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Failed to update status.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => (t.id || t._id) !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Failed to delete.');
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  // --- UI Actions ---
  const startEditing = (task, e) => {
    if (e) e.stopPropagation(); 
    const parsed = parseTask(task);
    setEditingTaskId(task.id || task._id);
    const dateVal = task.due_date ? task.due_date.split('T')[0] : '';
    setEditFormData({
      title: parsed.cleanTitle,
      due_date: dateVal,
      priority: (task.priority || 'medium').toLowerCase(),
      folder: parsed.folder
    });
    setActiveMenuTaskId(null);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditFormData({ title: '', due_date: '', priority: 'medium', folder: 'General' });
  };

  // --- Formatters ---
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return dateString.split('T')[0];
  };

  const getPriorityColor = (p) => {
    const priority = (p || '').toLowerCase();
    if (priority === 'high') return { bg: '#ffebee', text: '#c62828' };
    if (priority === 'low') return { bg: '#e8f5e9', text: '#2e7d32' };
    return { bg: '#e3f2fd', text: '#1565c0' };
  };

  const menuItemStyle = {
    display: 'block', width: '100%', padding: '10px 15px', border: 'none', background: 'transparent', 
    textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #f1f3f5', fontSize: '0.9rem', color: '#343a40'
  };

  // --- Render Prep ---
  const attentionData = getAttentionRequired(tasks);
  const processedTasks = tasks.map(parseTask);
  const filteredTasks = selectedFolder === 'All' 
    ? processedTasks 
    : processedTasks.filter(t => t.folder === selectedFolder);
  const sortedTasks = sortTasks(filteredTasks);

  if (!token) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>My Tasks</h1>
        <button onClick={handleLogout} 
          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Attention Required Section */}
      {attentionData.count > 0 && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>⚠️ Attention Required</h3>
          <p style={{ margin: 0 }}>You have <strong>{attentionData.count}</strong> high-priority overdue tasks.</p>
        </div>
      )}

      {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #ffcdd2', fontWeight: '500' }}>{error}</div>}

      {/* Add Task Form */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
        <h3 style={{ marginTop: 0 }}>Add New Task</h3>
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" name="title" value={createFormData.title} onChange={(e) => handleInputChange(e, setCreateFormData)} 
              placeholder="What needs to be done?" style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }} />
            <select name="folder" value={createFormData.folder} onChange={(e) => handleInputChange(e, setCreateFormData)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}>
              {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="date" name="due_date" value={createFormData.due_date} onChange={(e) => handleInputChange(e, setCreateFormData)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }} />
            <select name="priority" value={createFormData.priority} onChange={(e) => handleInputChange(e, setCreateFormData)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '10px', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add Task</button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button onClick={() => setSelectedFolder('All')} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', background: selectedFolder === 'All' ? '#343a40' : '#e9ecef', color: selectedFolder === 'All' ? 'white' : '#495057' }}>All</button>
        {FOLDERS.map(f => (
          <button key={f} onClick={() => setSelectedFolder(f)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', background: selectedFolder === f ? '#0d6efd' : '#e9ecef', color: selectedFolder === f ? 'white' : '#495057' }}>{f}</button>
        ))}
      </div>

      {/* Task List */}
      {loading ? <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>Loading tasks...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {sortedTasks.length === 0 ? <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>No tasks found in this folder.</p> : 
            sortedTasks.map(task => {
              const taskId = task.id || task._id;
              const isEditing = editingTaskId === taskId;
              const pColor = getPriorityColor(task.priority);
              
              if (isEditing) {
                return (
                  <form key={taskId} onSubmit={handleUpdateTask} onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '2px solid #0d6efd', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" name="title" value={editFormData.title} onChange={(e) => handleInputChange(e, setEditFormData)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select name="folder" value={editFormData.folder} onChange={(e) => handleInputChange(e, setEditFormData)} style={{ padding: '8px', flex: 1, border: '1px solid #ddd', borderRadius: '4px' }}>{FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                      <input type="date" name="due_date" value={editFormData.due_date} onChange={(e) => handleInputChange(e, setEditFormData)} style={{ padding: '8px', flex: 2, border: '1px solid #ddd', borderRadius: '4px' }} />
                      <select name="priority" value={editFormData.priority} onChange={(e) => handleInputChange(e, setEditFormData)} style={{ padding: '8px', flex: 1, border: '1px solid #ddd', borderRadius: '4px' }}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ padding: '8px 16px', background: '#198754', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                      <button type="button" onClick={cancelEditing} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </form>
                );
              }

              return (
                <div 
                  key={taskId} 
                  onClick={() => navigate(`/tasks/${taskId}`)} // UPDATED: NAVIGATE TO DETAILS
                  style={{ 
                    background: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px', padding: '15px', position: 'relative', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)', 
                    minHeight: '80px', cursor: 'pointer', transition: 'all 0.2s',
                    ':hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.08)' }
                  }}
                >
                  
                  {/* Category Badge (Left) */}
                  <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
                    <span style={{ fontSize: '0.75rem', background: '#343a40', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{task.folder}</span>
                  </div>

                  {/* Actions Stack (Right) */}
                  <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {/* Priority Badge */}
                    <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', background: pColor.bg, color: pColor.text, minWidth: '50px', textAlign: 'center' }}>
                      {task.priority}
                    </span>
                    {/* 3-Dots Menu */}
                    <div className="task-menu-wrapper" style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuTaskId(activeMenuTaskId === taskId ? null : taskId); }}
                        style={{ background: '#f8f9fa', border: '1px solid #e9ecef', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', color: '#333', borderRadius: '4px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', paddingBottom: '8px' }}>
                        ...
                      </button>
                      {activeMenuTaskId === taskId && (
                        <div style={{ position: 'absolute', top: '110%', right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50, minWidth: '130px' }}>
                          <button onClick={(e) => { e.stopPropagation(); startEditing(task, e); }} style={menuItemStyle}>✏️ Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(taskId); }} style={{ ...menuItemStyle, color: '#dc3545', borderBottom: 'none' }}>🗑️ Delete</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ marginTop: '30px', paddingRight: '50px' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#212529' }}>{task.cleanTitle}</h3>
                    <div style={{ fontSize: '0.95rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>📅 {formatDate(task.due_date)}</span>
                      
                      {!task.completed ? (
                         <span style={{ backgroundColor: '#e2e3e5', color: '#383d41', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #d6d8db' }}>
                           ● Pending
                         </span>
                      ) : (
                         <span style={{ backgroundColor: '#d1e7dd', color: '#0f5132', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #badbcc' }}>
                           ✓ Completed
                         </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
};

export default Tasks;