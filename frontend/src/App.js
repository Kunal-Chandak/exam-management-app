import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Classrooms from './pages/Classrooms';
import Subjects from './pages/Subjects';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import GenerateSeating from './pages/GenerateSeating';
import ViewSeating from './pages/ViewSeating';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Navbar />
                    <div className="main-content">
                      <Sidebar />
                      <div className="page-content">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/departments" element={<ProtectedRoute roles={["ADMIN", "OFFICE_INCHARGE"]}><Departments /></ProtectedRoute>} />
                          <Route path="/classrooms" element={<ProtectedRoute roles={["ADMIN", "OFFICE_INCHARGE"]}><Classrooms /></ProtectedRoute>} />
                          <Route path="/subjects" element={<ProtectedRoute roles={["ADMIN", "OFFICE_INCHARGE"]}><Subjects /></ProtectedRoute>} />
                          <Route path="/students" element={<ProtectedRoute roles={["ADMIN", "OFFICE_INCHARGE"]}><Students /></ProtectedRoute>} />
                          <Route path="/teachers" element={<ProtectedRoute roles={["ADMIN", "OFFICE_INCHARGE"]}><Teachers /></ProtectedRoute>} />
                          <Route path="/generate" element={<ProtectedRoute roles={["ADMIN"]}><GenerateSeating /></ProtectedRoute>} />
                          <Route path="/view" element={<ProtectedRoute roles={["ADMIN", "OFFICE_INCHARGE"]}><ViewSeating /></ProtectedRoute>} />
                          <Route path="*" element={<Dashboard />} />
                        </Routes>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
