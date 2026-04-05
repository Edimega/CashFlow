import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
	const { token, isLoading } = useContext(AuthContext);

	if (isLoading) {
		// Return a splash screen or loading indicator here
		return null;
	}

	return (
		<NavigationContainer theme={DarkTheme}>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{token == null ? (
					// No token found, user isn't signed in
					<Stack.Screen name="Auth" component={AuthNavigator} />
				) : (
					// User is signed in
					<Stack.Screen name="Main" component={MainNavigator} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
