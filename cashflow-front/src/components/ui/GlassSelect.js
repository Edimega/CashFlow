import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

export default function GlassSelect({ label, value, options, onSelect, placeholder = 'Selecciona una opción' }) {
	const [visible, setVisible] = useState(false);

	const selectedItem = options.find(opt => opt.value === value);

	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}

			<TouchableOpacity
				style={styles.trigger}
				onPress={() => setVisible(true)}
				activeOpacity={0.7}
			>
				<Text style={[styles.triggerText, !selectedItem && { color: COLORS.textSecondary }]}>
					{selectedItem ? selectedItem.label : placeholder}
				</Text>
				<Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
			</TouchableOpacity>

			<Modal
				visible={visible}
				transparent
				animationType="fade"
				onRequestClose={() => setVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setVisible(false)}
				>
					<BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />

					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>{label || 'Seleccionar'}</Text>

						<FlatList
							data={options}
							keyExtractor={item => item.value}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[styles.item, item.value === value && styles.selectedItem]}
									onPress={() => {
										onSelect(item.value);
										setVisible(false);
									}}
								>
									<View style={styles.itemRow}>
										<View style={styles.itemTextContainer}>
											<Text style={styles.itemLabel}>{item.label}</Text>
											{item.sublabel && <Text style={styles.itemSublabel}>{item.sublabel}</Text>}
										</View>
										{item.value === value && (
											<Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
										)}
									</View>
								</TouchableOpacity>
							)}
							contentContainerStyle={{ paddingBottom: 20 }}
							showsVerticalScrollIndicator={false}
						/>

						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => setVisible(false)}
						>
							<Text style={styles.closeButtonText}>Cancelar</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	label: {
		color: COLORS.textSecondary,
		marginBottom: 8,
		marginLeft: 4,
		fontSize: 14,
	},
	trigger: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderColor: 'rgba(255,255,255,0.2)',
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	triggerText: {
		color: COLORS.textPrimary,
		fontSize: 16,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
		padding: 20,
	},
	modalContent: {
		backgroundColor: '#1E1E2E',
		borderRadius: 24,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
		width: '100%',
		maxHeight: '60%',
		padding: 20,
		shadowColor: COLORS.primaryGlow,
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 10,
	},
	modalTitle: {
		color: COLORS.primary,
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	item: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: 'rgba(255,255,255,0.03)',
	},
	selectedItem: {
		backgroundColor: 'rgba(0, 242, 255, 0.1)',
		borderColor: 'rgba(0, 242, 255, 0.3)',
		borderWidth: 1,
	},
	itemRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	itemTextContainer: {
		flex: 1,
	},
	itemLabel: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: '600',
	},
	itemSublabel: {
		color: COLORS.textSecondary,
		fontSize: 12,
		marginTop: 2,
	},
	closeButton: {
		marginTop: 10,
		paddingVertical: 12,
		alignItems: 'center',
	},
	closeButtonText: {
		color: COLORS.danger,
		fontSize: 16,
		fontWeight: 'bold',
	},
});
