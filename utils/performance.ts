// Performance monitoring utilities
export class PerformanceMonitor {
	private static measurements: Map<string, number> = new Map();

	static startTimer(label: string): void {
		this.measurements.set(label, performance.now());
	}

	static endTimer(label: string): number {
		const startTime = this.measurements.get(label);
		if (!startTime) {
			console.warn(`No start time found for ${label}`);
			return 0;
		}

		const duration = performance.now() - startTime;
		this.measurements.delete(label);

		if (__DEV__ && duration > 16) {
			// Log slow operations (>16ms)
			console.log(
				`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`
			);
		}

		return duration;
	}

	static measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
		return new Promise(async (resolve, reject) => {
			this.startTimer(label);
			try {
				const result = await fn();
				this.endTimer(label);
				resolve(result);
			} catch (error) {
				this.endTimer(label);
				reject(error);
			}
		});
	}

	static measure<T>(label: string, fn: () => T): T {
		this.startTimer(label);
		try {
			const result = fn();
			this.endTimer(label);
			return result;
		} catch (error) {
			this.endTimer(label);
			throw error;
		}
	}
}

// React hook for measuring component render times
export const useRenderTimer = (componentName: string) => {
	const renderStart = React.useRef(performance.now());

	React.useEffect(() => {
		if (__DEV__) {
			const renderTime = performance.now() - renderStart.current;
			if (renderTime > 16) {
				console.log(
					`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
				);
			}
		}
		renderStart.current = performance.now();
	});
};

declare const __DEV__: boolean;
declare const React: any;
