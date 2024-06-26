export class DebounceAbortError<R = unknown> extends Error {
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
 * @description Resolve debounce abort error.
 *
 * Return the error if it is a {@link DebounceAbortError} and throw it otherwise.
 *
 * ---
 * @param {Err} error unknown error
 * @returns {DebounceAbortError<R>} debounce abort error
 * @throws {Err} unknown error that is not a debounce abort error.
 * ---
 * @example
 * ```
 * const result: T | DebounceAbortError = await debounce.exec()
 * 	.catch(resolveAbortError)
 * 	.catch(err => {
 * 		// handle some other error ...
 * 	});
 * ```
 */
export function resolveAbortError<Err = unknown, R = unknown>(error: Err): DebounceAbortError<R> {
	if (error instanceof DebounceAbortError) {
		return error;
	}

	throw error;
}
