import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; 

function Login({ onLogin }) {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            const data = await response.json();
            if (data.success) {
                onLogin();
                navigate('/dashboard');
            } else {
                setErrorMessage('Invalid email or password');
            }
        } catch (error) {
            setErrorMessage('Login failed, please try again.');
        }
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword }),
            });
            if (response.status === 201) {
                setErrorMessage('Registration successful! Please log in.');
            } else {
                setErrorMessage('Registration failed, please try again.');
            }
        } catch (error) {
            setErrorMessage('Registration failed, please try again.');
        }
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                <button type="submit">Login</button>
                <p>{errorMessage}</p>
            </form>

            <h1>Register</h1>
            <form onSubmit={handleRegistration}>
                <input type="text" placeholder="Name" value={registerName} onChange={e => setRegisterName(e.target.value)} required />
                <input type="email" placeholder="Email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} required />
                <button type="submit">Register</button>
                <p>{errorMessage}</p>
            </form>
        </div>
    );
}

export default Login;
