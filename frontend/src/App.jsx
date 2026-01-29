import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } 
          />
          {/* NEW ROUTE: Task Details */}
          <Route 
            path="/tasks/:id" 
            element={
              <ProtectedRoute>
                <TaskDetails />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;