import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestEditor from './pages/TestEditor';
import TeacherArena from "./pages/TeacherArena";
import EnterName from "./pages/EnterName";
import EnterPin from "./pages/EnterPin";
import StudentArena from './pages/StudentArena';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/join    " />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/editor/:testId" element={<TestEditor />} />
                <Route path="/arena/teacher/:pin" element={<TeacherArena />} />
                <Route path="/join" element={<EnterPin />} />
                <Route path="/join/:pin" element={<EnterName />} />
                <Route path="/arena/student/:pin" element={<StudentArena />} />
            </Routes>
        </Router>
    );
}

export default App;