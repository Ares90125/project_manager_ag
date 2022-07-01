export function OnPropertyChange<T = any>(methodName: string, scope?: any) {
	return (target: T, key: keyof T): void => {
		const originalDescriptor = Object.getOwnPropertyDescriptor(target, key);
		let val;

		// Wrap hook methods
		Object.defineProperty(target, key, {
			set(value) {
				const instance = this;
				const previousValue = val;

				if (previousValue === value) {
					return;
				}

				val = value;
				if (originalDescriptor) {
					originalDescriptor.set.call(instance, value);
				}

				if (methodName && val !== previousValue) {
					instance[methodName].call(scope || instance, value, previousValue);
				}
			},
			get() {
				const instance = this;
				if (originalDescriptor) {
					return originalDescriptor.get.call(instance);
				}
				return val;
			}
		});
	};
}
