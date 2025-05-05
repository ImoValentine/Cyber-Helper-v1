// src/pages/AuthPage.jsx
import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";
import "./AuthPage.css";
import Lottie from "react-lottie";
import animationData from "../Assets/animation.json";

const AuthPage = () => {
    const auth = useAuth();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        renderer: "svg",
    };

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    // When already authenticated, redirect using <Navigate>
    if (auth.isAuthenticated) {
        return <Navigate to="/app" replace />;
    }

    return (
        <>
            {/* Marquee Section */}
            <div className="marquee-wrapper">
                <div className="marquee-track">
                    <div className="marquee-content">
                        AI- Agent007, reliable solutions, consensus logic, Groq, Hugggingface, Gemini, Making solutions easier, Reducing operational costs
                    </div>
                    <div className="marquee-content">
                        AI- Agent007, reliable solutions, consensus logic, Groq, Hugggingface, Gemini, Making solutions easier, Reducing operational costs
                    </div>
                </div>
            </div>

            {/* Auth Container Section */}
            <div className="auth-container">
                <div className="left-side">
                    <h1>Cyber Helper</h1>
                    <p className="secondary-text">Deconstructing Errors, Constructing Solutions</p>
                    <p>Sign in to access Cyber Helper.</p>
                    <div className="animation-wrapper" style={{ marginTop: "40px" }}>
                        <Lottie options={defaultOptions} height={200} width={200} speed={1.5} />
                    </div>
                </div>

                <div className="right-side">
                    <div className="auth-form">
                        <h2>Login</h2>
                        <button className="btn btn-primary" onClick={() => auth.signinRedirect()}>
                            Sign in with Cognito
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
