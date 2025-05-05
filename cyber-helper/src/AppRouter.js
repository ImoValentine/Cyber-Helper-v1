// src/AppRouter.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import AuthPage from "./pages/AuthPage";
import App from "./App";

const ProtectedRoute = ({ children }) => {
    const auth = useAuth();
    console.log("ProtectedRoute - isLoading:", auth.isLoading);
    console.log("ProtectedRoute - isAuthenticated:", auth.isAuthenticated);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (!auth.isAuthenticated) {
        // If not authenticated, send the user to the AuthPage ("/")
        return <Navigate to="/" replace />;
    }

    return children;
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
