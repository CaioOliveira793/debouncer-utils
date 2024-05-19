export class DebouncerAbortError<R = unknown> extends Error {
	public readonly reason?: R;

	public constructor(reason?: R, options?: ErrorOptions) {
		super('debounced operation aborted', options);
		this.reason = reason;
	}
}

/**
 * @template Err
 * @template R
 * ---
 * @description Resolve debouncer abort error.
 *
 * Return the error if it is a debouncer abort error and throw it otherwise.
 *
 * ---
 * @param {Err} error unknown error
 * @returns {DebouncerAbortError<R>} debouncer abort error
 * @throws {Err} unknown error that is not a debouncer abort error.
 * ---
 * @example
 * ```
 * const result: T | DebouncerAbortError = await debouncer.exec()
 * 	.catch(resolveAbortError)
 * 	.catch(err => {
 * 		// handle some other error ...
 * 	});
 * ```
 */
export function resolveAbortError<Err = unknown, R = unknown>(
	error: Err
): DebouncerAbortError<R> {
	if (error instanceof DebouncerAbortError) {
		return error;
	}

	throw error;
}
