import assert from 'node:assert';
import { makePromiseObj } from '@/util/Promise';

describe('util/Promise', () => {
	it('create a promise fragmented into parts', async () => {
		const { promise, reject, resolve } = makePromiseObj<void>();

		assert.ok(promise instanceof Promise);
		assert.strictEqual(typeof reject, 'function');
		assert.strictEqual(typeof resolve, 'function');

		resolve();
		await promise;
	});

	it('resolve the promise after calling the resolve function', async () => {
		const { promise, resolve } = makePromiseObj<string>();

		resolve('ok');
		const value = await promise;

		assert.strictEqual(value, 'ok');
	});

	it('reject the promise after calling the reject function', async () => {
		const { promise, reject } = makePromiseObj<string>();

		let value: string | void = undefined;

		reject('err');

		try {
			value = await promise;
		} catch (err) {
			assert.strictEqual(err, 'err');
		}

		assert.strictEqual(value, undefined);
	});
});
