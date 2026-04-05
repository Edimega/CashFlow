import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
	return (
		<SafeAreaProvider style={{ backgroundColor: '#0F0F1A' }}>
			<AuthProvider>
				<StatusBar style="light" />
				<AppNavigator />
			</AuthProvider>
		</SafeAreaProvider>
	);
}
