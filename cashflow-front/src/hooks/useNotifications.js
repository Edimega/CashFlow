import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import api from '../api/api';

/**
 * Custom Hook to poll notifications every 5 seconds.
 * It strictly pauses polling when the application goes to the background.
 */
export function useNotifications() {
	const [notifications, setNotifications] = useState([]);
	const appState = useRef(AppState.currentState);
	const pollInterval = useRef(null);

	const fetchNotifications = async () => {
		try {
			const res = await api.get('/notifications/poll');
			setNotifications(res.data);
		} catch (err) {
			console.error('Failed to poll notifications', err);
		}
	};

	const startPolling = () => {
		if (!pollInterval.current) {
			fetchNotifications(); // Fetch immediately
			pollInterval.current = setInterval(fetchNotifications, 5000); // Poll every 5s
		}
	};

	const stopPolling = () => {
		if (pollInterval.current) {
			clearInterval(pollInterval.current);
			pollInterval.current = null;
		}
	};

	useEffect(() => {
		// Start polling immediately on mount if active
		if (appState.current === 'active') {
			startPolling();
		}

		const subscription = AppState.addEventListener('change', nextAppState => {
			if (
				appState.current.match(/inactive|background/) &&
				nextAppState === 'active'
			) {
				// App has come to the foreground
				startPolling();
			} else if (nextAppState.match(/inactive|background/)) {
				// App has gone to the background
				stopPolling();
			}
			appState.current = nextAppState;
		});

		return () => {
			stopPolling();
			subscription.remove();
		};
	}, []);

	const markAsRead = async (id) => {
		try {
			await api.put(`/notifications/${id}/read`);
			setNotifications(prev => prev.filter(n => n._id !== id));
		} catch (err) {
			console.error('Failed to mark notification as read');
		}
	};

	return { notifications, markAsRead };
}
