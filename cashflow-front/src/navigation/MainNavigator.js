import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from '../screens/main/AdminDashboard';
import StandardDashboard from '../screens/main/StandardDashboard';
import CreateUserScreen from '../screens/main/CreateUserScreen';
import TransactionHistory from '../screens/main/TransactionHistory';
import TransactionForm from '../screens/main/TransactionForm';
import LoanCalculator from '../screens/main/LoanCalculator';
import UserManagementScreen from '../screens/main/UserManagementScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
	const { user } = useContext(AuthContext);

	if (!user) return null; // Wait for user state to be hydrated

	// Simple role-based routing decision
	const initialRoute = user?.role === 'Admin' ? 'AdminHome' : 'StandardHome';

	return (
		<Stack.Navigator
			initialRouteName={initialRoute}
			screenOptions={{ headerShown: false }}
		>
			<Stack.Screen name="TransactionHistory" component={TransactionHistory} />
			<Stack.Screen name="AdminHome" component={AdminDashboard} />
			<Stack.Screen name="StandardHome" component={StandardDashboard} />
			<Stack.Screen name="CreateUser" component={CreateUserScreen} />
			<Stack.Screen name="TransactionForm" component={TransactionForm} />
			<Stack.Screen name="LoanCalculator" component={LoanCalculator} />
			<Stack.Screen name="UserManagement" component={UserManagementScreen} />
		</Stack.Navigator>
	);
}
