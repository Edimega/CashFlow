import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import GlassButton from '../../components/ui/GlassButton';

export default function AdminDashboard({ navigation }) {
	const { logout } = useContext(AuthContext);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.glowOrb1} />
			<View style={styles.glowOrb2} />

			<ScrollView contentContainerStyle={styles.scroll}>
				<Text style={styles.title}>Panel de Admin</Text>
				<Text style={styles.subtitle}>Supervisa usuarios y finanzas</Text>

				<GlassButton
					title="Agregar Movimiento"
					onPress={() => navigation.navigate('TransactionForm')}
					style={{ marginTop: 40 }}
				/>

				<GlassButton
					title="Ver Movimientos"
					onPress={() => navigation.navigate('TransactionHistory')}
					style={{ marginTop: 20 }}
				/>

				<GlassButton
					title="Ver Saldos"
					onPress={() => navigation.navigate('UserManagement')}
					style={{ marginTop: 20 }}
				/>

				<GlassButton
					title="Crear Usuario Estándar"
					onPress={() => navigation.navigate('CreateUser')}
					style={{ marginTop: 20 }}
				/>

				<GlassButton
					title="Calculadora de Préstamos"
					onPress={() => navigation.navigate('LoanCalculator')}
					style={{ marginTop: 20 }}
				/>

				<GlassButton title="Cerrar Sesión" onPress={logout} type="danger" style={{ marginTop: 60 }} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	scroll: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 24,
	},
	glowOrb1: {
		position: 'absolute',
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: COLORS.primaryGlow,
		top: -100,
		right: -100,
	},
	glowOrb2: {
		position: 'absolute',
		width: 250,
		height: 250,
		borderRadius: 125,
		backgroundColor: 'rgba(255, 0, 127, 0.15)', // Pink glow
		bottom: -50,
		left: -50,
	},
	title: {
		color: COLORS.primary,
		fontSize: 34,
		fontWeight: '800',
	},
	subtitle: {
		color: COLORS.textSecondary,
		fontSize: 16,
		marginTop: 8,
		marginBottom: 20
	}
});
