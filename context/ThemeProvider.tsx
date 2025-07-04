import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorValue } from 'react-native';
import Colors from '@/constants/colors';

interface ThemeContextType {
	isDarkMode: boolean;
	toggleTheme: () => void;
	colors: {
		background: readonly [ColorValue, ColorValue, ColorValue];
		text: string;
		card: string;
		cardText: string;
		cardSubtext: string;
		border: string;
		primary: string;
	};
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [isDarkMode, setIsDarkMode] = useState(true);

	useEffect(() => {
		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem('isDarkMode');
				if (savedTheme !== null) {
					setIsDarkMode(JSON.parse(savedTheme));
				}
			} catch (error) {
				console.error('Error loading theme setting:', error);
			}
		};

		loadTheme();
	}, []);

	const toggleTheme = async () => {
		const newValue = !isDarkMode;
		setIsDarkMode(newValue);
		try {
			await AsyncStorage.setItem('isDarkMode', JSON.stringify(newValue));
		} catch (error) {
			console.error('Error saving theme setting:', error);
		}
	};

	const colors = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

	return (
		<ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
			{children}
		</ThemeContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return context;
};
