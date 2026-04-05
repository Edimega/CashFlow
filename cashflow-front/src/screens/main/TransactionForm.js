import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassSelect from '../../components/ui/GlassSelect';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS } from '../../theme/colors';

export default function TransactionForm({ navigation }) {
	const { user } = useContext(AuthContext);
	const [type, setType] = useState('Inflow');
	const [amount, setAmount] = useState('');
	const [observations, setObservations] = useState('');
	const [targetUserId, setTargetUserId] = useState('');
	const [users, setUsers] = useState([]);
	const [loadingUsers, setLoadingUsers] = useState(false);

	const transactionTypes = [
		{ label: 'Ingreso', value: 'Inflow' },
		{ label: 'Retiro', value: 'Withdrawal' },
	];

	useEffect(() => {
		if (user?.role === 'Admin') {
			fetchUsers();
		}
	}, []);

	const fetchUsers = async () => {
		setLoadingUsers(true);
		try {
			const res = await api.get('/users/assigned');
			setUsers(res.data.map(u => ({
				label: u.name,
				sublabel: u.email,
				value: u._id
			})));
		} catch (err) {
			console.error('Error fetching users:', err);
		} finally {
			setLoadingUsers(false);
		}
	};

	const submitForm = async () => {
		try {
			const payload = {
				type,
				amount: Number(amount),
				observations
			};
			if (user?.role === 'Admin' && targetUserId) {
				payload.userId = targetUserId;
			}

			await api.post('/transactions', payload);
			Alert.alert('Éxito', 'Transacción guardada correctamente');
			navigation.goBack();
		} catch (err) {
			console.error(err);
			Alert.alert('Error', err.response?.data?.message || 'Error al guardar la transacción');
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
					</TouchableOpacity>
					<Text style={styles.title}>Nuevo Movimiento</Text>
					<View style={{ width: 24 }} />
				</View>

				<ScrollView contentContainerStyle={{ padding: 16 }}>
					<GlassCard style={styles.card}>
						<GlassSelect
							label="Tipo de Movimiento"
							placeholder="Selecciona el tipo"
							value={type}
							options={transactionTypes}
							onSelect={setType}
						/>

						<Text style={styles.label}>Monto</Text>
						<GlassInput
							value={amount}
							onChangeText={setAmount}
							keyboardType="numeric"
							style={styles.input}
						/>

						<Text style={styles.label}>Observaciones</Text>
						<GlassInput
							value={observations}
							onChangeText={setObservations}
							multiline
							style={[styles.input, { height: 80 }]}
						/>

						{user?.role === 'Admin' && (
							<GlassSelect
								label="Asignar a Usuario (Estándar)"
								placeholder={loadingUsers ? "Cargando usuarios..." : "Selecciona un usuario"}
								value={targetUserId}
								options={users}
								onSelect={setTargetUserId}
							/>
						)}

						<GlassButton title="Guardar Transacción" onPress={submitForm} style={{ marginTop: 20 }} />
					</GlassCard>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.background },
	container: { flex: 1 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginBottom: 8,
	},
	backButton: { padding: 4 },
	title: {
		color: COLORS.primary,
		fontSize: 24,
		fontWeight: 'bold',
	},
	card: {
		paddingVertical: 24,
	},
	label: {
		color: COLORS.textSecondary,
		marginBottom: 8,
		marginLeft: 4,
	},
	input: {
		marginBottom: 16,
	}
});
