import {
	Inter_400Regular,
	Inter_600SemiBold,
	Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AudioProvider } from '@/context/AudioProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import GameProvider from '@/context/GameProvider';
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

SplashScreen.preventAutoHideAsync();

// connect to drizzle DB
const expo = SQLite.openDatabaseSync('db.db');

export const db = drizzle(expo);

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		'Inter-Regular': Inter_400Regular,
		'Inter-SemiBold': Inter_600SemiBold,
		'Inter-Bold': Inter_700Bold,
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<ThemeProvider>
			<GameProvider>
				<AudioProvider>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name='(home)' />
						<Stack.Screen name='+not-found' />
					</Stack>
				</AudioProvider>
			</GameProvider>
		</ThemeProvider>
	);
}
