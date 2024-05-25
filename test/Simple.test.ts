import assert from 'node:assert';
import { Debouncer } from '@/lib';

function delay(time: number): Promise<void> {
	return new Promise<void>(resolve => {
		setTimeout(resolve, time);
	});
}

// TODO: add more tests

describe('lib > simple use', () => {
	it('create and execute a debounced operation', async () => {
		let timesExecuted = 0;
		const operation = () => {
			timesExecuted += 1;
		};

		const debounce = new Debouncer(operation, 50);

		debounce.execUnsafe();
		assert.strictEqual(timesExecuted, 0);

		await delay(50);
		assert.strictEqual(timesExecuted, 1);
	});

	it('create and execute a debounced operation once', async () => {
		let timesExecuted = 0;
		const operation = () => {
			timesExecuted += 1;
		};

		const debounce = new Debouncer(operation, 100);

		for (let i = 0; i < 3; i++) {
			debounce.execUnsafe();
			assert.strictEqual(timesExecuted, 0);
		}

		await delay(100);
		assert.strictEqual(timesExecuted, 1);
	});

	it('execute a operation multiple times debouncing in between short spaced operations', async () => {
		let timesExecuted = 0;
		const operation = () => {
			timesExecuted += 1;
		};

		const debounce = new Debouncer(operation, 100);

		for (let runs = 0; runs < 3; runs++) {
			for (let i = 0; i < 3; i++) {
				debounce.execUnsafe();
				assert.strictEqual(timesExecuted, runs);
			}

			await delay(100);
			assert.strictEqual(timesExecuted, runs + 1);
		}

		assert.strictEqual(timesExecuted, 3);
	});

	it('execute a operation multiple times when the time between operations is grater than the delay', async () => {
		let timesExecuted = 0;
		const operation = () => {
			timesExecuted += 1;
		};

		const debounce = new Debouncer(operation, 50);

		for (let i = 0; i < 3; i++) {
			debounce.execUnsafe();
			await delay(50);
			assert.strictEqual(timesExecuted, i + 1);
		}

		assert.strictEqual(timesExecuted, 3);
	});
});

describe('lib > unhandled operation error', () => {
	it('catch an error thrown from the debounced operation when its awaited', async () => {
		let timesExecuted = 0;
		const operation = () => {
			timesExecuted += 1;
			throw new Error('operation error');
		};

		const debounce = new Debouncer(operation, 5);

		let error: unknown;
		try {
			await debounce.execUnsafe();
		} catch (err: unknown) {
			error = err;
		}

		assert.deepStrictEqual(error, new Error('operation error'));
		assert.strictEqual(timesExecuted, 1);
	});

	it.skip('not catch error thrown from the debounced operation when not awaited', async () => {
		let timesExecuted = 0;
		const external = async () => {
			const operation = () => {
				timesExecuted += 1;
				throw new Error('js is horse shit. promises suck');
			};

			const debounce = new Debouncer(operation, 50);

			let promise;
			let error: unknown;
			try {
				promise = debounce.execUnsafe();

				// give time to see if `execUnsafe` returned promise fails.
				await delay(100);

				// not awaited
				promise;
			} catch (err: unknown) {
				error = err;
			}

			// `execUnsafe` didn't throw, although it was executed
			assert.deepStrictEqual(error, undefined);
			assert.strictEqual(timesExecuted, 1);

			// return the promise to `external`
			return promise;
		};

		try {
			// await the `external` function that encloses all this mess.
			await external();
		} catch (err: unknown) {
			// yes. the external function throws and the error is currently beeing handled.
			// But it doesn't matter. Once a promise is rejected before being
			// awaited, it will create a unhandled rejection event (in this case, failing the test).
			assert.deepStrictEqual(err, new Error('js is horse shit. promises suck'));
		}

		// executed only once.
		assert.strictEqual(timesExecuted, 1);
	});
});
