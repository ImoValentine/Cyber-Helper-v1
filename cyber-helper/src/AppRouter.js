import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import App from './App';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated ? children : <Navigate to="/" />;
};

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <App />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default AppRouter;
