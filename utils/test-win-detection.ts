// Test script to verify win detection logic

type Player = 'X' | 'O' | null;

const checkWinner = (
	board: Player[]
): { winner: Player | 'draw' | null; pattern: number[] | null } => {
	// Validate board input
	if (!board || board.length !== 9) {
		console.error('Invalid board provided to checkWinner');
		return { winner: null, pattern: null };
	}

	const winPatterns = [
		[0, 1, 2], // Top row
		[3, 4, 5], // Middle row
		[6, 7, 8], // Bottom row
		[0, 3, 6], // Left column
		[1, 4, 7], // Middle column
		[2, 5, 8], // Right column
		[0, 4, 8], // Main diagonal
		[2, 4, 6], // Anti-diagonal
	];

	for (const pattern of winPatterns) {
		const [a, b, c] = pattern;

		// Ensure indices are valid
		if (a < 0 || a > 8 || b < 0 || b > 8 || c < 0 || c > 8) {
			console.error('Invalid pattern indices:', pattern);
			continue;
		}

		// Check if all three positions have the same non-null player
		const cellA = board[a];
		const cellB = board[b];
		const cellC = board[c];

		if (cellA && cellA === cellB && cellA === cellC) {
			// Return a sorted copy of the pattern to ensure consistent ordering
			const sortedPattern = [...pattern].sort((x, y) => x - y);
			return { winner: cellA, pattern: sortedPattern };
		}
	}

	return { winner: null, pattern: null };
};

// Test cases
const testCases = [
	{
		name: 'Top row X wins',
		board: ['X', 'X', 'X', null, null, null, null, null, null] as Player[],
		expectedWinner: 'X',
		expectedPattern: [0, 1, 2],
	},
	{
		name: 'Middle column O wins',
		board: [null, 'O', null, null, 'O', null, null, 'O', null] as Player[],
		expectedWinner: 'O',
		expectedPattern: [1, 4, 7],
	},
	{
		name: 'Main diagonal X wins',
		board: ['X', null, null, null, 'X', null, null, null, 'X'] as Player[],
		expectedWinner: 'X',
		expectedPattern: [0, 4, 8],
	},
	{
		name: 'Anti-diagonal O wins',
		board: [null, null, 'O', null, 'O', null, 'O', null, null] as Player[],
		expectedWinner: 'O',
		expectedPattern: [2, 4, 6],
	},
	{
		name: 'No winner',
		board: ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'] as Player[],
		expectedWinner: null,
		expectedPattern: null,
	},
	{
		name: 'Bottom row X wins',
		board: [null, null, null, null, null, null, 'X', 'X', 'X'] as Player[],
		expectedWinner: 'X',
		expectedPattern: [6, 7, 8],
	},
	{
		name: 'Left column O wins',
		board: ['O', null, null, 'O', null, null, 'O', null, null] as Player[],
		expectedWinner: 'O',
		expectedPattern: [0, 3, 6],
	},
	{
		name: 'Right column X wins',
		board: [null, null, 'X', null, null, 'X', null, null, 'X'] as Player[],
		expectedWinner: 'X',
		expectedPattern: [2, 5, 8],
	},
	{
		name: 'Middle row O wins',
		board: [null, null, null, 'O', 'O', 'O', null, null, null] as Player[],
		expectedWinner: 'O',
		expectedPattern: [3, 4, 5],
	},
	{
		name: 'Almost winning but not quite',
		board: ['X', 'X', null, 'O', 'O', null, null, null, null] as Player[],
		expectedWinner: null,
		expectedPattern: null,
	},
	{
		name: 'Full board with no winner',
		board: ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'] as Player[],
		expectedWinner: null,
		expectedPattern: null,
	},
];

export function runWinDetectionTests() {
	console.log('Running win detection tests...');

	let passed = 0;
	let failed = 0;

	testCases.forEach((testCase, index) => {
		const result = checkWinner(testCase.board);

		const winnerMatches = result.winner === testCase.expectedWinner;
		const patternMatches =
			JSON.stringify(result.pattern) ===
			JSON.stringify(testCase.expectedPattern);

		if (winnerMatches && patternMatches) {
			console.log(`✅ Test ${index + 1}: ${testCase.name} - PASSED`);
			passed++;
		} else {
			console.log(`❌ Test ${index + 1}: ${testCase.name} - FAILED`);
			console.log(
				`  Expected winner: ${testCase.expectedWinner}, got: ${result.winner}`
			);
			console.log(
				`  Expected pattern: ${JSON.stringify(
					testCase.expectedPattern
				)}, got: ${JSON.stringify(result.pattern)}`
			);
			failed++;
		}
	});

	console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

	// Run additional comprehensive tests
	testPatternSorting();
	testAllWinPatterns();

	return { passed, failed };
}

// Test line calculation for winning line component
export function testLineCalculation(winPattern: number[], cellSize: number) {
	if (!winPattern || winPattern.length !== 3) {
		console.error('Invalid winning pattern for line calculation');
		return null;
	}

	// Ensure pattern is sorted for consistent line drawing
	const sortedPattern = [...winPattern].sort((x, y) => x - y);
	const [a, b, c] = sortedPattern;

	// Validate pattern indices
	if (a < 0 || a > 8 || b < 0 || b > 8 || c < 0 || c > 8) {
		console.error('Invalid winning pattern indices:', sortedPattern);
		return null;
	}

	const startRow = Math.floor(a / 3);
	const startCol = a % 3;
	const endRow = Math.floor(c / 3);
	const endCol = c % 3;

	// Calculate exact center positions
	const startX = startCol * cellSize + cellSize / 2;
	const startY = startRow * cellSize + cellSize / 2;
	const endX = endCol * cellSize + cellSize / 2;
	const endY = endRow * cellSize + cellSize / 2;

	// Calculate line properties
	const deltaX = endX - startX;
	const deltaY = endY - startY;
	const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

	// Calculate center position for the line
	const centerX = startX + deltaX / 2;
	const centerY = startY + deltaY / 2;

	// Add a small buffer to ensure the line extends slightly beyond cell centers
	const buffer = 2;
	const adjustedLength = length + buffer * 2;

	console.log(`Line calculation for pattern ${JSON.stringify(winPattern)} (sorted: ${JSON.stringify(sortedPattern)}):`);
	console.log(`  Start: (${startX}, ${startY}), End: (${endX}, ${endY})`);
	console.log(
		`  Center: (${centerX}, ${centerY}), Length: ${length}, Adjusted Length: ${adjustedLength}, Angle: ${angle}°`
	);

	return {
		startX,
		startY,
		endX,
		endY,
		centerX,
		centerY,
		length,
		adjustedLength,
		angle,
		sortedPattern,
	};
}

// Test all win patterns for line drawing accuracy
export function testAllWinPatterns(cellSize: number = 100) {
	console.log('\n=== Testing Line Drawing for All Win Patterns ===');
	
	const allWinPatterns = [
		[0, 1, 2], // Top row
		[3, 4, 5], // Middle row
		[6, 7, 8], // Bottom row
		[0, 3, 6], // Left column
		[1, 4, 7], // Middle column
		[2, 5, 8], // Right column
		[0, 4, 8], // Main diagonal
		[2, 4, 6], // Anti-diagonal
	];

	allWinPatterns.forEach((pattern, index) => {
		console.log(`\nPattern ${index + 1}: ${JSON.stringify(pattern)}`);
		const result = testLineCalculation(pattern, cellSize);
		if (result) {
			console.log(`  ✓ Line calculation successful`);
			console.log(`  ✓ Sorted pattern: ${JSON.stringify(result.sortedPattern)}`);
			console.log(`  ✓ Angle: ${result.angle.toFixed(2)}°`);
			console.log(`  ✓ Length: ${result.length.toFixed(2)}px`);
		} else {
			console.log(`  ✗ Line calculation failed`);
		}
	});

	console.log('\n=== Line Drawing Tests Complete ===\n');
}

// Test pattern sorting consistency
export function testPatternSorting() {
	console.log('\n=== Testing Pattern Sorting Consistency ===');
	
	const testPatterns = [
		[0, 1, 2], // Already sorted
		[2, 1, 0], // Reverse sorted
		[1, 0, 2], // Mixed order
		[8, 4, 0], // Diagonal reverse
		[6, 4, 2], // Anti-diagonal reverse
	];

	testPatterns.forEach((pattern, index) => {
		const sorted = [...pattern].sort((x, y) => x - y);
		console.log(`Pattern ${index + 1}: ${JSON.stringify(pattern)} → ${JSON.stringify(sorted)}`);
	});

	console.log('=== Pattern Sorting Tests Complete ===\n');
}
