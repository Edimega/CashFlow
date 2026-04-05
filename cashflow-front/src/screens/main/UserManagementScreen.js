import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import GlassCard from '../../components/ui/GlassCard';
import MoneyDisplay from '../../components/ui/MoneyDisplay';
import { COLORS } from '../../theme/colors';

export default function UserManagementScreen({ navigation }) {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await api.get('/users/assigned');
			setUsers(res.data);
		} catch (err) {
			console.error('Error fetching users:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const renderItem = ({ item }) => (
		<GlassCard style={styles.card}>
			<View style={styles.cardContent}>
				<View style={styles.userInfo}>
					<Text style={styles.userName}>{item.name}</Text>
					<Text style={styles.userEmail}>{item.email}</Text>
				</View>
				<View style={styles.balanceInfo}>
					<Text style={styles.balanceLabel}>Saldo Actual</Text>
					<MoneyDisplay
						amount={item.balance}
						fontSize={20}
						color={item.balance >= 0 ? COLORS.success : COLORS.danger}
					/>
				</View>
			</View>
		</GlassCard>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.title}>Gestión de Usuarios</Text>
				<View style={{ width: 24 }} />
			</View>

			{loading ? (
				<View style={styles.loader}>
					<ActivityIndicator size="large" color={COLORS.primary} />
				</View>
			) : (
				<FlatList
					data={users}
					keyExtractor={item => item._id}
					renderItem={renderItem}
					contentContainerStyle={styles.list}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
							<Text style={styles.emptyText}>No tienes usuarios asignados todavía.</Text>
						</View>
					}
					refreshing={loading}
					onRefresh={fetchUsers}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backButton: { padding: 4 },
	title: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
	list: { padding: 16 },
	card: { marginBottom: 12 },
	cardContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	userInfo: { flex: 1 },
	userName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
	userEmail: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
	balanceInfo: { alignItems: 'flex-end' },
	balanceLabel: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 2 },
	loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
	emptyText: { color: COLORS.textSecondary, fontSize: 16, marginTop: 16, textAlign: 'center' },
});
