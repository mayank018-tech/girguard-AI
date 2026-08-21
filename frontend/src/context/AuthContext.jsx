import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../services/api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiCall = async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
            ...options.headers
        };
        const baseUrl = API_BASE_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(baseUrl + endpoint, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'API Error');
        return data.data; // Return just the data part (token and user)
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('name');
        const email = localStorage.getItem('email');
        if (token && role) {
            setUser({ role, name, email });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('name', data.user.name);
        localStorage.setItem('email', data.user.email);
        setUser(data.user);
        return data.user;
    };

    const signup = async (userData) => {
        const data = await apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('name', data.user.name);
        localStorage.setItem('email', data.user.email);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, apiCall }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
