import React, { useState } from 'react';
import './AuthPage.css';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const clearMessages = () => setMessage('');

    const handleLogin = async () => {
        if (!email || !password) {
            setMessage("Please fill in both fields.");
            return;
        }

        try {
            const response = await fetch('https://v7rxxi579a.execute-api.eu-north-1.amazonaws.com/dev3/LoginUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                body: JSON.stringify({ email: email.trim(), password: password.trim() }),
            });

            // Parse the top-level response JSON
            const jsonData = await response.json();
            console.log('Login Response Status:', response.status);
            console.log('Login Response OK:', response.ok);
            console.log('Login Response Data:', jsonData);

            // If API Gateway wraps the actual payload in a "body" property, parse it
            let loginData = jsonData;
            if (jsonData.body) {
                try {
                    loginData = JSON.parse(jsonData.body);
                } catch (err) {
                    console.error("Error parsing nested JSON:", err);
                }
            }

            if (response.ok && loginData.message === 'Login successful') {
                console.log('Login success condition met, redirecting...');
                setMessage("✅ Login successful!");
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', email);
                window.location.href = '/app';
                return;
            }

            setMessage(loginData.error || "❌ Invalid credentials.");
        } catch (error) {
            console.error("Login Fetch Error:", error.message);
            console.error("Error Stack:", error.stack);
            setMessage(`❌ Failed to connect to the server: ${error.message}.`);
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            setMessage("Please fill in both fields.");
            return;
        }

        try {
            const response = await fetch('https://v7rxxi579a.execute-api.eu-north-1.amazonaws.com/dev2reg/Register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim(), password: password.trim() }),
            });

            const jsonData = await response.json();
            console.log('Register Response Status:', response.status);
            console.log('Register Response OK:', response.ok);
            console.log('Register Response Data:', jsonData);

            // Optionally parse nested JSON from "body" if needed
            let registerData = jsonData;
            if (jsonData.body) {
                try {
                    registerData = JSON.parse(jsonData.body);
                } catch (err) {
                    console.error("Error parsing nested JSON for register:", err);
                }
            }

            if (response.status === 201) {
                setMessage("✅ Registration successful!");
                console.log('Register success:', registerData);
            } else {
                setMessage(registerData.error || "❌ Registration failed.");
            }
        } catch (error) {
            console.error("Register Fetch Error:", error.message);
            console.error("Error Stack:", error.stack);
            setMessage(`❌ Failed to connect to the server: ${error.message}.`);
        }
    };

    return (
        <div className="auth-container">
            <div className="left-side">
                <h1>Welcome</h1>
                <p>Sign in or register to access Cyber Helper</p>
            </div>
            <div className="right-side">
                <div className="auth-form">
                    <h2>Login or Register</h2>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            clearMessages();
                        }}
                        placeholder="Enter your email"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            clearMessages();
                        }}
                        placeholder="Enter your password"
                    />
                    <button onClick={handleLogin}>Login</button>
                    <button onClick={handleRegister}>Register</button>
                    {message && <p>{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
