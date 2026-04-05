import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import MoneyDisplay from '../../components/ui/MoneyDisplay';
import { COLORS } from '../../theme/colors';

export default function StandardDashboard({ navigation }) {
	const { user, logout, refreshUser } = useContext(AuthContext);
	const [transactions, setTransactions] = useState([]);
	const [pendingTx, setPendingTx] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		setLoading(true);
		try {
			// Refresh user to get latest balance
			await refreshUser();

			// Get recent transactions
			const res = await api.get('/transactions?limit=5');
			setTransactions(res.data.transactions);

			// Check for any pending transaction for this user
			// We filter by 'Pending' status
			const pendingRes = await api.get('/transactions?status=Pending&limit=1');
			if (pendingRes.data.transactions.length > 0) {
				setPendingTx(pendingRes.data.transactions[0]);
			} else {
				setPendingTx(null);
			}
		} catch (err) {
			console.error('Error fetching dashboard data:', err);
		} finally {
			setLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, [])
	);

	const handleStatusUpdate = async (status) => {
		try {
			await api.put(`/transactions/${pendingTx._id}/status`, { status });
			Alert.alert('Éxito', status === 'Approved' ? 'Movimiento aprobado' : 'Movimiento rechazado');
			setPendingTx(null);
			fetchData(); // Refresh balance and list
		} catch (err) {
			console.error(err);
			Alert.alert('Error', 'No se pudo procesar la solicitud');
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.glowOrb1} />

			<View style={styles.header}>
				<View>
					<Text style={styles.welcomeText}>Hola, {user?.name}</Text>
					<Text style={styles.subtitle}>Tu resumen financiero</Text>
				</View>
				<TouchableOpacity onPress={logout} style={styles.logoutButton}>
					<Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
				{/* Balance Section */}
				<GlassCard style={styles.balanceCard}>
					<Text style={styles.balanceLabel}>Saldo Disponible</Text>
					<MoneyDisplay amount={user?.balance} fontSize={48} />
				</GlassCard>

				{/* Quick Actions */}
				<View style={styles.actionsRow}>
					<TouchableOpacity
						style={styles.actionItem}
						onPress={() => navigation.navigate('TransactionForm')}
					>
						<View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '33' }]}>
							<Ionicons name="add" size={28} color={COLORS.primary} />
						</View>
						<Text style={styles.actionText}>Nuevo</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.actionItem}
						onPress={() => navigation.navigate('TransactionHistory')}
					>
						<View style={[styles.actionIcon, { backgroundColor: COLORS.success + '33' }]}>
							<Ionicons name="list" size={28} color={COLORS.success} />
						</View>
						<Text style={styles.actionText}>Historia</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.actionItem}
						onPress={() => navigation.navigate('LoanCalculator')}
					>
						<View style={[styles.actionIcon, { backgroundColor: '#FFD70033' }]}>
							<Ionicons name="calculator-outline" size={28} color="#FFD700" />
						</View>
						<Text style={styles.actionText}>Calculadora</Text>
					</TouchableOpacity>
				</View>

				{/* Recent Movements */}
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Movimientos Recientes</Text>
					<TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
						<Text style={styles.seeAll}>Ver todo</Text>
					</TouchableOpacity>
				</View>

				{loading ? (
					<ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
				) : (
					transactions.map((tx) => (
						<View key={tx._id} style={styles.txItem}>
							<View style={[styles.txIcon, { backgroundColor: tx.type === 'Inflow' ? COLORS.success + '22' : COLORS.danger + '22' }]}>
								<Ionicons
									name={tx.type === 'Inflow' ? 'arrow-down' : 'arrow-up'}
									size={20}
									color={tx.type === 'Inflow' ? COLORS.success : COLORS.danger}
								/>
							</View>
							<View style={styles.txDetails}>
								<Text style={styles.txType}>
									{tx.type === 'Inflow' ? 'Ingreso' : 'Retiro'}
									{tx.status === 'Pending' && <Text style={styles.pendingTag}> (Pendiente)</Text>}
								</Text>
								<Text style={styles.txDate}>{new Date(tx.receiptDate).toLocaleDateString()}</Text>
							</View>
							<MoneyDisplay amount={tx.amount} fontSize={18} color={tx.type === 'Inflow' ? COLORS.success : COLORS.danger} />
						</View>
					))
				)}
				<View style={{ height: 40 }} />
			</ScrollView>

			{/* Approval Modal */}
			<Modal visible={!!pendingTx} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
					<View style={styles.modalContent}>
						<Ionicons name="alert-circle" size={60} color={COLORS.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
						<Text style={styles.modalTitle}>Aprobación Requerida</Text>
						<Text style={styles.modalDesc}>
							El administrador ha registrado un movimiento para tu cuenta. Por favor verifica los detalles:
						</Text>

						<GlassCard style={styles.modalDetailsCard}>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Tipo:</Text>
								<Text style={styles.detailValue}>{pendingTx?.type === 'Inflow' ? 'Ingreso' : 'Retiro'}</Text>
							</View>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Monto:</Text>
								<MoneyDisplay amount={pendingTx?.amount} fontSize={24} color={COLORS.primary} />
							</View>
							{pendingTx?.observations && (
								<View style={styles.detailRow}>
									<Text style={styles.detailLabel}>Obs:</Text>
									<Text style={styles.detailValue}>{pendingTx.observations}</Text>
								</View>
							)}
						</GlassCard>

						<View style={styles.modalActions}>
							<TouchableOpacity
								style={[styles.modalButton, { backgroundColor: COLORS.success }]}
								onPress={() => handleStatusUpdate('Approved')}
							>
								<Text style={styles.modalButtonText}>Aprobar</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.modalButton, { backgroundColor: COLORS.danger, marginLeft: 12 }]}
								onPress={() => handleStatusUpdate('Rejected')}
							>
								<Text style={styles.modalButtonText}>Rechazar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 24,
		paddingVertical: 20,
	},
	welcomeText: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' },
	subtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
	logoutButton: { padding: 8 },
	scroll: { paddingHorizontal: 24 },
	balanceCard: {
		paddingVertical: 30,
		alignItems: 'center',
		marginBottom: 30,
	},
	balanceLabel: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 35,
	},
	actionItem: { alignItems: 'center' },
	actionIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	actionText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '600' },
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
	seeAll: { color: COLORS.primary, fontSize: 14 },
	txItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		backgroundColor: 'rgba(255,255,255,0.03)',
		padding: 12,
		borderRadius: 16,
	},
	txIcon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	txDetails: { flex: 1 },
	txType: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 16 },
	txDate: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
	pendingTag: { color: COLORS.primary, fontSize: 12, fontStyle: 'italic' },
	glowOrb1: {
		position: 'absolute',
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: COLORS.primaryGlow,
		top: -100,
		left: -100,
	},

	// Modal Styles
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	modalContent: {
		width: '100%',
		padding: 24,
		borderRadius: 32,
		backgroundColor: 'rgba(30, 30, 45, 0.95)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	modalTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
	modalDesc: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
	modalDetailsCard: { padding: 16, marginBottom: 24, backgroundColor: 'rgba(255,255,255,0.05)' },
	detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	detailLabel: { color: COLORS.textSecondary, fontSize: 14 },
	detailValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
	modalActions: { flexDirection: 'row' },
	modalButton: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
	modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
