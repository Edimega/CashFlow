import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import MoneyDisplay from '../../components/ui/MoneyDisplay';
import { COLORS } from '../../theme/colors';
import api from '../../api/api';

export default function LoanCalculator({ navigation }) {
	const [principal, setPrincipal] = useState('');
	const [interest, setInterest] = useState('');
	const [periods, setPeriods] = useState('');
	const [periodType, setPeriodType] = useState('Monthly'); // Default
	const [result, setResult] = useState(null);

	const calculateLoan = async () => {
		if (!principal || !interest || !periods) {
			Alert.alert('Error', 'Por favor completa todos los campos');
			return;
		}

		try {
			const res = await api.post('/loans/calculate', {
				principal: Number(principal),
				interestRate: Number(interest),
				periods: Number(periods),
				periodType
			});
			setResult(res.data);
		} catch (err) {
			console.error(err);
			Alert.alert('Error', 'Falló el cálculo');
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.title}>Calculadora de Préstamos</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView contentContainerStyle={styles.scroll}>

				<GlassCard style={styles.card}>
					<Text style={styles.label}>Monto Principal ($)</Text>
					<GlassInput
						value={principal}
						onChangeText={setPrincipal}
						keyboardType="numeric"
						style={styles.input}
					/>

					<Text style={styles.label}>Tasa de Interés (%)</Text>
					<GlassInput
						value={interest}
						onChangeText={setInterest}
						keyboardType="numeric"
						style={styles.input}
					/>

					<Text style={styles.label}>Número de Periodos</Text>
					<GlassInput
						value={periods}
						onChangeText={setPeriods}
						keyboardType="numeric"
						style={styles.input}
					/>

					<Text style={styles.label}>Tipo de Periodo (ej. Mensual)</Text>
					<GlassInput
						value={periodType}
						onChangeText={setPeriodType}
						style={styles.input}
					/>

					<GlassButton title="Calcular" onPress={calculateLoan} style={{ marginTop: 10 }} />
				</GlassCard>

				{result && (
					<GlassCard style={[styles.card, { marginTop: 24 }]}>
						<Text style={styles.resultTitle}>Resultados</Text>
						<View style={styles.row}>
							<Text style={styles.rLabel}>Cuota:</Text>
							<MoneyDisplay amount={result.installmentAmount} fontSize={18} color={COLORS.textPrimary} />
						</View>
						<View style={styles.row}>
							<Text style={styles.rLabel}>Total Pagado:</Text>
							<MoneyDisplay amount={result.totalAmountPaid} fontSize={18} color={COLORS.textPrimary} />
						</View>
						<View style={styles.row}>
							<Text style={styles.rLabel}>Total Interés:</Text>
							<MoneyDisplay amount={result.totalInterest} fontSize={18} color={COLORS.textPrimary} />
						</View>
					</GlassCard>
				)}
			</ScrollView>
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
	scroll: {
		padding: 16,
		paddingBottom: 40,
	},
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
	},
	resultTitle: {
		color: COLORS.success,
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	rLabel: {
		color: COLORS.textSecondary,
		fontSize: 16,
	},
	rValue: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: 'bold',
	}
});
