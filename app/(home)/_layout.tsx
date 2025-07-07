import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/ThemeProvider';

export default function HomeLayout() {
	const { isDarkMode } = useTheme();
	return (
		<>
			<StatusBar style={isDarkMode ? 'light' : 'dark'} translucent={true} />
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
		</>
	);
}
