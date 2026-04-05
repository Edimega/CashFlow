import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import GlassCard from '../../components/ui/GlassCard';
import MoneyDisplay from '../../components/ui/MoneyDisplay';
import { COLORS } from '../../theme/colors';

export default function TransactionHistory({ navigation }) {
	const [transactions, setTransactions] = useState([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);

	const fetchTransactions = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const res = await api.get(`/transactions?page=${page}&limit=15`);
			setTransactions([...transactions, ...res.data.transactions]);
			setPage(page + 1);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, []);

	const renderItem = ({ item }) => {
		const typeLabels = {
			'Inflow': 'Ingreso',
			'Loan Payment': 'Pago Préstamo',
			'Withdrawal': 'Retiro'
		};

		return (
			<GlassCard style={styles.card}>
				<View style={styles.row}>
					<Text style={styles.typeText}>{typeLabels[item.type] || item.type}</Text>
					<MoneyDisplay
						amount={item.amount}
						fontSize={18}
						color={item.type === 'Inflow' ? COLORS.success : COLORS.danger}
					/>
				</View>
				<Text style={styles.dateText}>{new Date(item.receiptDate).toLocaleDateString('es-ES')}</Text>
				{item.userId && <Text style={styles.userText}>Usuario: {item.userId.name}</Text>}
				{item.observations && <Text style={styles.obsText}>{item.observations}</Text>}
			</GlassCard>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.title}>Historial</Text>
				<View style={{ width: 24 }} />
			</View>

			<FlatList
				data={transactions}
				keyExtractor={item => item._id}
				renderItem={renderItem}
				onEndReached={fetchTransactions}
				onEndReachedThreshold={0.5}
				contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
				ListEmptyComponent={
					!loading && (
						<View style={styles.emptyContainer}>
							<Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
							<Text style={styles.emptyText}>No se encontraron transacciones aún.</Text>
						</View>
					)
				}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginBottom: 8,
	},
	backButton: {
		padding: 4,
	},
	title: {
		color: COLORS.primary,
		fontSize: 24,
		fontWeight: 'bold',
	},
	card: {
		marginBottom: 12,
		marginHorizontal: 16,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	typeText: {
		color: COLORS.textPrimary,
		fontWeight: '600',
	},
	amountText: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	dateText: {
		color: COLORS.textSecondary,
		fontSize: 12,
		marginBottom: 4,
	},
	obsText: {
		color: '#ccc',
		fontSize: 14,
		fontStyle: 'italic',
	},
	userText: {
		color: COLORS.primary,
		fontSize: 13,
		fontWeight: '600',
		marginBottom: 4,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 60,
	},
	emptyText: {
		color: COLORS.textSecondary,
		fontSize: 16,
		marginTop: 16,
	}
});
