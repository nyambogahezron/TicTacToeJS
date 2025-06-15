import * as SQLite from 'expo-sqlite';

// Open the database
const db = SQLite.openDatabase('game.db');

// Initialize the database tables
export const initDatabase = () => {
	return new Promise((resolve, reject) => {
		db.transaction(
			(tx) => {
				// Create coins table
				tx.executeSql(
					`CREATE TABLE IF NOT EXISTS coins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount INTEGER NOT NULL DEFAULT 0,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
					[],
					() => {
						// Create stats table
						tx.executeSql(
							`CREATE TABLE IF NOT EXISTS stats (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              games_played INTEGER DEFAULT 0,
              games_won INTEGER DEFAULT 0,
              highest_score INTEGER DEFAULT 0,
              total_score INTEGER DEFAULT 0,
              last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );`,
							[],
							() => {
								// Initialize coins if not exists
								tx.executeSql(
									'INSERT OR IGNORE INTO coins (amount) VALUES (0);',
									[],
									() => {
										// Initialize stats if not exists
										tx.executeSql(
											'INSERT OR IGNORE INTO stats (games_played, games_won, highest_score, total_score) VALUES (0, 0, 0, 0);',
											[],
											() => resolve(true),
											(_, error) => {
												reject(error);
												return false;
											}
										);
									},
									(_, error) => {
										reject(error);
										return false;
									}
								);
							},
							(_, error) => {
								reject(error);
								return false;
							}
						);
					},
					(_, error) => {
						reject(error);
						return false;
					}
				);
			},
			(error) => {
				reject(error);
				return false;
			}
		);
	});
};

// Coins operations
export const getCoins = (): Promise<number> => {
	return new Promise((resolve, reject) => {
		db.transaction(
			(tx) => {
				tx.executeSql(
					'SELECT amount FROM coins ORDER BY id DESC LIMIT 1;',
					[],
					(_, { rows }) => {
						if (rows.length > 0) {
							resolve(rows.item(0).amount);
						} else {
							resolve(0);
						}
					},
					(_, error) => {
						reject(error);
						return false;
					}
				);
			},
			(error) => {
				reject(error);
				return false;
			}
		);
	});
};

export const updateCoins = (amount: number): Promise<void> => {
	return new Promise((resolve, reject) => {
		db.transaction(
			(tx) => {
				tx.executeSql(
					'UPDATE coins SET amount = ?, last_updated = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM coins ORDER BY id DESC LIMIT 1);',
					[amount],
					() => resolve(),
					(_, error) => {
						reject(error);
						return false;
					}
				);
			},
			(error) => {
				reject(error);
				return false;
			}
		);
	});
};

export const addCoins = (amount: number): Promise<void> => {
	return new Promise((resolve, reject) => {
		getCoins()
			.then((currentCoins) => {
				updateCoins(currentCoins + amount)
					.then(() => resolve())
					.catch((error) => {
						reject(error);
						return false;
					});
			})
			.catch((error) => {
				reject(error);
				return false;
			});
	});
};

// Stats operations
export const getStats = (): Promise<{
	gamesPlayed: number;
	gamesWon: number;
	highestScore: number;
	totalScore: number;
}> => {
	return new Promise((resolve, reject) => {
		db.transaction(
			(tx) => {
				tx.executeSql(
					'SELECT games_played, games_won, highest_score, total_score FROM stats ORDER BY id DESC LIMIT 1;',
					[],
					(_, { rows }) => {
						if (rows.length > 0) {
							const stats = rows.item(0);
							resolve({
								gamesPlayed: stats.games_played,
								gamesWon: stats.games_won,
								highestScore: stats.highest_score,
								totalScore: stats.total_score,
							});
						} else {
							resolve({
								gamesPlayed: 0,
								gamesWon: 0,
								highestScore: 0,
								totalScore: 0,
							});
						}
					},
					(_, error) => {
						reject(error);
						return false;
					}
				);
			},
			(error) => {
				reject(error);
				return false;
			}
		);
	});
};

export const updateStats = (stats: {
	gamesPlayed?: number;
	gamesWon?: number;
	highestScore?: number;
	totalScore?: number;
}): Promise<void> => {
	return new Promise((resolve, reject) => {
		getStats()
			.then((currentStats) => {
				const updatedStats = {
					gamesPlayed: stats.gamesPlayed ?? currentStats.gamesPlayed,
					gamesWon: stats.gamesWon ?? currentStats.gamesWon,
					highestScore: stats.highestScore ?? currentStats.highestScore,
					totalScore: stats.totalScore ?? currentStats.totalScore,
				};

				db.transaction(
					(tx) => {
						tx.executeSql(
							`UPDATE stats 
           SET games_played = ?, 
               games_won = ?, 
               highest_score = ?, 
               total_score = ?,
               last_updated = CURRENT_TIMESTAMP 
           WHERE id = (SELECT id FROM stats ORDER BY id DESC LIMIT 1);`,
							[
								updatedStats.gamesPlayed,
								updatedStats.gamesWon,
								updatedStats.highestScore,
								updatedStats.totalScore,
							],
							() => resolve(),
							(_, error) => {
								reject(error);
								return false;
							}
						);
					},
					(error) => {
						reject(error);
						return false;
					}
				);
			})
			.catch((error) => {
				reject(error);
				return false;
			});
	});
};

// Initialize database when the service is imported
initDatabase().catch((error) => {
	console.error('Failed to initialize database:', error);
});
