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
            ...(token ? { 'Authorization': \Bearer \\ } : {}),
            ...options.headers
        };
        const res = await fetch(\\\\, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'API Error');
        return data;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            apiCall('/auth/me')
                .then(res => {
                    setUser(res.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const signup = async (name, email, password, role_code) => {
        const res = await apiCall('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, role_code }) });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, apiCall }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
