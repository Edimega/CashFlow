import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * MoneyDisplay Component
 * Formats numbers with "." for thousands and "," for decimals.
 * Decimals are displayed at 50% font size for a premium look.
 */
export default function MoneyDisplay({ amount, style, color, fontSize = 24 }) {
	const num = Number(amount) || 0;

	// Split into integer and decimal parts
	// Using a robust manual formatting for thousands separator "." and decimal ","
	const parts = num.toFixed(2).split('.');
	const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	const decimalPart = parts[1];

	return (
		<Text style={[styles.container, style, { color: color || '#fff', fontSize }]}>
			<Text style={{ fontSize }}>${integerPart}</Text>
			<Text style={{ fontSize: fontSize * 0.6 }}>,{decimalPart}</Text>
		</Text>
	);
}

const styles = StyleSheet.create({
	container: {
		fontWeight: 'bold',
		fontFamily: 'System', // Use default for better compatibility with bold nested parts
	}
});
