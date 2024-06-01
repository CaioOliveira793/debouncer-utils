import assert from 'node:assert';
import { DebounceAbortError, resolveAbortError } from '@/AbortError';

describe('AbortError > DebounceAbortError', () => {
	it('inherit from the Error type', () => {
		const error = new DebounceAbortError();

		assert.ok(error instanceof Error);
	});

	it('describe the reason for the aborted operation', () => {
		const error = new DebounceAbortError('operation aborted due to server unreachable');

		assert.strictEqual(error.reason, 'operation aborted due to server unreachable');
	});

	it('create a error chain', () => {
		const error = new DebounceAbortError('operation aborted due to server unreachable', {
			cause: new Error('tcp stream closed'),
		});

		assert.deepStrictEqual(error.cause, new Error('tcp stream closed'));
	});
});

describe('AbortError > resolveAbortError', () => {
	it('return the error when it is a DebouncerAbortError', () => {
		const error = new DebounceAbortError();

		const abortError = resolveAbortError(error);

		assert.deepStrictEqual(abortError, error);
	});

	it('throw the error when it is not a DebouncerAbortError', () => {
		const error = new Error('any error');

		let abortError: DebounceAbortError | void = undefined;

		try {
			abortError = resolveAbortError(error);
		} catch (err: unknown) {
			assert.deepStrictEqual(err, error);
		}

		assert.deepStrictEqual(abortError, undefined);
	});

	it('resolve the DebouncerAbortError in a promise catch chain', async () => {
		{
			let otherError: unknown | void = undefined;

			const result = await Promise.reject(new DebounceAbortError('cancel'))
				.catch(resolveAbortError)
				.catch(err => {
					otherError = err;
				});

			assert.deepStrictEqual(result, new DebounceAbortError('cancel'));
			assert.deepStrictEqual(otherError, undefined);
		}
		{
			let otherError: unknown | void = undefined;

			const result = await Promise.reject(new Error('any error'))
				.catch(resolveAbortError)
				.catch(err => {
					otherError = err;
				});

			assert.deepStrictEqual(result, undefined);
			assert.deepStrictEqual(otherError, new Error('any error'));
		}
	});
});
