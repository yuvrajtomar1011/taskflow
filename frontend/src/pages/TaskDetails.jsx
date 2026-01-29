import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateTask, deleteTask } from '../services/taskService';
import api from '../services/api';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    title: '',
    due_date: '',
    priority: 'medium',
    folder: 'General'
  });

  const FOLDERS = ['General', 'Work', 'Personal', 'Urgent'];

  // --- Helper: Parse Task Title/Folder ---
  const parseTask = (rawTask) => {
    const title = rawTask.title || '';
    const match = title.match(/^\[(.*?)\]\s*(.*)$/);
    if (match && FOLDERS.includes(match[1])) {
      return { ...rawTask, cleanTitle: match[2], folder: match[1] };
    }
    return { ...rawTask, cleanTitle: title, folder: 'General' };
  };

  const formatTitleForSave = (cleanTitle, folder) => {
    if (folder === 'General') return cleanTitle;
    return `[${folder}] ${cleanTitle}`;
  };

  // --- Fetch Task ---
  useEffect(() => {
    const fetchTask = async () => {
      try {
        // Direct API call since we didn't add getTaskById to service
        const response = await api.get(`/tasks/${id}/`);
        setTask(response.data);
      } catch (err) {
        console.error("Fetch Details Error:", err);
        if (err.response?.status === 401) {
           localStorage.removeItem('token');
           window.location.href = '/login';
        } else {
           setError('Task not found or error loading details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  // --- Handlers ---
  const handleToggleComplete = async () => {
    if (!task) return;
    try {
      const payload = { ...task, completed: !task.completed };
      const updated = await updateTask(id, payload);
      setTask(updated);
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = () => {
    const parsed = parseTask(task);
    setFormData({
      title: parsed.cleanTitle,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      priority: (task.priority || 'medium').toLowerCase(),
      folder: parsed.folder
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const finalTitle = formatTitleForSave(formData.title, formData.folder);
    const payload = {
      title: finalTitle,
      due_date: formData.due_date ? formData.due_date : null,
      priority: formData.priority.toLowerCase(),
      completed: task.completed
    };

    try {
      const updated = await updateTask(id, payload);
      setTask(updated);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save changes.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading document...</div>;
  if (!task) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error || 'Task not found'}</div>;

  const parsedTask = parseTask(task);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* Navigation Header */}
      <button onClick={() => navigate('/tasks')} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem' }}>
        ← Back to Tasks
      </button>

      {/* Workspace Card */}
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* Header / Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <span style={{ background: '#343a40', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginRight: '10px' }}>
              {parsedTask.folder}
            </span>
            <span style={{ textTransform: 'uppercase', color: '#666', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>
              {task.priority} Priority
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
             {!isEditing && (
               <>
                <button onClick={handleToggleComplete} style={{ padding: '8px 16px', background: task.completed ? '#6c757d' : '#198754', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {task.completed ? 'Mark Pending' : '✓ Complete'}
                </button>
                <button onClick={startEdit} style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                  Edit
                </button>
                <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Delete
                </button>
               </>
             )}
          </div>
        </div>

        {/* Content Area */}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleEditChange} 
              style={{ fontSize: '1.5rem', padding: '10px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} 
            />
            <div style={{ display: 'flex', gap: '20px' }}>
               <select name="folder" value={formData.folder} onChange={handleEditChange} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
                 {FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
               </select>
               <select name="priority" value={formData.priority} onChange={handleEditChange} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
                 <option value="low">Low</option>
                 <option value="medium">Medium</option>
                 <option value="high">High</option>
               </select>
               <input type="date" name="due_date" value={formData.due_date} onChange={handleEditChange} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
              <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 20px 0', color: '#212529', lineHeight: '1.2' }}>
              {parsedTask.cleanTitle}
            </h1>
            
            <div style={{ display: 'flex', gap: '40px', borderTop: '1px solid #eee', paddingTop: '20px', color: '#555' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>DUE DATE</label>
                <div style={{ fontSize: '1.1rem' }}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due Date'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>STATUS</label>
                <div style={{ fontSize: '1.1rem', color: task.completed ? 'green' : '#d9534f' }}>
                  {task.completed ? 'Completed' : 'Pending'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;