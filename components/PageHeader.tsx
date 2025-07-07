import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { router } from 'expo-router';

interface PageHeaderProps {
	title: string;
	subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
	const { colors } = useTheme();
	return (
		<Animated.View
			entering={FadeInUp.springify()}
			style={[styles.header, { borderBottomColor: colors.border }]}
		>
			<TouchableOpacity
				style={[styles.backButton, { backgroundColor: colors.card }]}
				onPress={() => router.back()}
				activeOpacity={0.8}
			>
				<ArrowLeft size={24} color={colors.cardText} />
			</TouchableOpacity>
			<View style={styles.headerTitle}>
				<Text style={[styles.title, { color: colors.cardText }]}>{title}</Text>
				{subtitle && (
					<Text style={{ color: colors.text, fontSize: 14 }}>{subtitle}</Text>
				)}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 5,
		paddingBottom: 20,
	},
	backButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	headerTitle: {
		flex: 1,
	},
	title: {
		fontSize: 25,
		fontFamily: 'Inter-Bold',
	},
});
