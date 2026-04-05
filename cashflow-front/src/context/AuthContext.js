import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		checkToken();
	}, []);

	const checkToken = async () => {
		try {
			const storedToken = await AsyncStorage.getItem('userToken');
			const storedRole = await AsyncStorage.getItem('userRole');
			const storedId = await AsyncStorage.getItem('userId');
			const storedName = await AsyncStorage.getItem('userName');

			if (storedToken) {
				setToken(storedToken);
				setUser({ role: storedRole, id: storedId, name: storedName });
				// Trigger a background refresh to get latest balance/data
				refreshUser(storedToken);
			}
		} catch (e) {
			console.log('Failed to fetch token', e);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			const response = await api.post('/auth/login', { email, password });
			const { token: newToken, role, id, name } = response.data;

			await AsyncStorage.setItem('userToken', newToken);
			await AsyncStorage.setItem('userRole', role);
			await AsyncStorage.setItem('userId', id);
			await AsyncStorage.setItem('userName', name || '');

			setToken(newToken);
			setUser({ role, id, name });
			return { success: true };
		} catch (e) {
			console.error('Login error', e.response?.data || e.message);
			return { success: false, message: e.response?.data?.message || 'Login failed' };
		}
	};

	const logout = async () => {
		try {
			await AsyncStorage.removeItem('userToken');
			await AsyncStorage.removeItem('userRole');
			await AsyncStorage.removeItem('userId');
			await AsyncStorage.removeItem('userName');
			setToken(null);
			setUser(null);
		} catch (e) {
			console.log('Error during logout', e);
		}
	};

	const refreshUser = async (explicitToken) => {
		try {
			// If we passed an explicit token (during hydration), use it
			const res = await api.get('/users/me');
			setUser(res.data);
			if (res.data.name) {
				await AsyncStorage.setItem('userName', res.data.name);
			}
		} catch (e) {
			console.log('Failed to refresh user', e);
		}
	};

	return (
		<AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
};
