import type {
	CallbackContext,
	Func,
	DebounceResult,
	ReadyDebounceAction,
	DebounceFlushResult,
	CancelDebounceAction,
	AbortDebounceAction,
} from '@/Type';
import { DebouncerAbortError } from '@/AbortError';
import { initialDebouncerState, updateOperationFn, type DebouncerState } from '@/State';

export class Debouncer<Args extends Array<unknown>, T> {
	/**
	 * @description Debouncer delay in milliseconds.
	 */
	public readonly delay: number;
	/**
	 * @description Callback function.
	 */
	public readonly callback: Func<CallbackContext, Args, T>;

	/**
	 * @description
	 * Instantiate a new {@link Debouncer} with a callback to be executed
	 * and the delay time in **milliseconds**.
	 *
	 * ## Callback
	 *
	 * The `callback` argument can be any js function (**sync** or **async**, **normal** or **arrow**), although there are
	 * some limitations around those options.
	 *
	 * - `normal` vs. `arrow`: A function created with the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function `function` keyword}
	 *   can have it's context (`this`) modified after declaration, thus, allowing the Debouncer to pass it's {@link CallbackContext}
	 *   as the function *this*, giving support for async cancellation.
	 *
	 *   In the case of an arrow function, the
	 *   {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#using_call_bind_and_apply context is fixed}
	 *   in the locality of it's declaration, so it's not possible to change the *this*, supplying a {@link CallbackContext}.
	 * - `sync` vs. `async`: any type of synchronous function (`normal` or `arrow`) is fully supported. Once the callback starts running,
	 *   there is no room to request for cancellation, so no {@link CallbackContext} is needed.
	 *
	 *   An asynchronous function that wants to support **async cancellation** will need a callback that can be provided with
	 *   a {@link CallbackContext}, in this case, a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function function expression}
	 *   is required (`function () { .. }`).
	 *
	 * ### Callback context (`this`)
	 *
	 * The callback function will have a different **this** when executed
	 * ({@link CallbackContext the CallbackContext type}). *this* will have the `signal` property that can be used for
	 * **async cancellation** with the {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal abort signal}.
	 *
	 * Using an arrow function will prevent the *this* modification, limiting the {@link abort debounce.abort} functionality.
	 *
	 * ---
	 * @param {Func<null, Args, T>} callback function to be debounced.
	 * @param {number} delay the debouncing delay in **milliseconds**.
	 */
	public constructor(callback: Func<CallbackContext, Args, T>, delay: number) {
		this.callback = callback;
		this.delay = delay;
	}

	/**
	 * @summary Execute the {@link callback} function **debouncing** by the {@link delay} amount
	 * of **millisenconds**.
	 *
	 * @description
	 * This function will **immediately return** a promise to be awaited for a fulfilment or
	 * rejection of the {@link callback} execution.
	 *
	 * ## Safety
	 *
	 * Is **strongly advised** to await this promise, since aborted operations or any exception
	 * thrown from the {@link callback} function will cause a **Unhandled promise rejection**.
	 *
	 * @see {@link exec} for a safer version of this function.
	 * @see {@link https://nodejs.org/api/process.html#event-unhandledrejection NodeJS unhandled rejection event} for a NodeJS environment.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event Window unhandled rejection event} for a Browser environment.
	 *
	 * ---
	 * @param {...Args} args callback arguments.
	 * @returns {Promise<Awaited<T>>} promise of the callback execution.
	 * @throws {unknown} {@link DebouncerAbortError debouncer abort error} or any error thrown by the {@link callback} function.
	 *
	 * ---
	 * @example
	 * ```
	 * try {
	 * 	const returnValue = await debounce.execUnsafe(arg1, arg2, arg3);
	 * } catch (err: unknown) {
	 * 	// handle any error thrown by the debounced callback ...
	 * 	console.error(err);
	 * }
	 * ```
	 */
	public execUnsafe(...args: Args): Promise<Awaited<T>> {
		// TODO: document what happens if a operation was previously started and:
		// - it is running: the current execution is used
		// XOR
		// - is not running: cancel the previous and schedule a new execution.
		if (this.state?.running) {
			return this.state.operation.promise;
		}

		if (!this.state) {
			this.state = initialDebouncerState(this.callback, ...args);
			this.state.timeoutID = setTimeout(this.makeTimeoutFn(), this.delay) as unknown as number;

			return this.state.operation.promise;
		}

		clearTimeout(this.state.timeoutID);
		updateOperationFn(this.state, this.callback, ...args);

		this.state.timeoutID = setTimeout(this.makeTimeoutFn(), this.delay) as unknown as number;

		return this.state.operation.promise;
	}

	/**
	 * @summary Execute the {@link callback} function **debouncing** by the {@link delay} amount
	 * of **millisenconds**.
	 *
	 * @description
	 * This function **immediately returns** a promise that will resolve into a
	 * {@link DebounceResult safe result} of the {@link callback} execution.
	 *
	 * ## Return value
	 *
	 * The returned promise can be resolved in one of 3 ways:
	 *
	 * - 'ok': the callback executed completly without any exception being thrown.
	 * - 'error': the callback has thrown an exception.
	 * - 'abort': the debounce operation was aborted.
	 *
	 * @see {@link DebounceResult} for more information about the type.
	 *
	 * ---
	 * @param {...Args} args callback arguments.
	 * @returns {Promise<DebounceResult<Awaited<T>, E>>} safe promise resulting the callback execution.
	 *
	 * ---
	 * @example
	 * ```
	 * const result = debounce.exec<EType>(arg1, arg2, arg3);
	 * switch (result.type) {
	 * 	case 'ok': {
	 * 		// handle the callback return value
	 * 		doSomething(result.value); // value is T
	 * 		break;
	 * 	}
	 * 	case 'abort': {
	 * 		// handle the aborted debounced operation
	 * 		handleCancelation(result.value); // value is DebouncerAbortError
	 * 		break;
	 * 	}
	 * 	case 'error': {
	 * 		// handle the callback exception
	 * 		handleError(result.value); // value is EType or unknown by default
	 * 		break;
	 * 	}
	 * }
	 * ```
	 */
	public async exec<E = unknown>(...args: Args): Promise<DebounceResult<Awaited<T>, E>> {
		try {
			return { type: 'ok', value: await this.execUnsafe(...args) };
		} catch (err: unknown) {
			if (err instanceof DebouncerAbortError) {
				return { type: 'abort', value: err };
			}
			return { type: 'error', value: err as E };
		}
	}

	public ready(value: T): ReadyDebounceAction {
		if (!this.state) {
			return 'noop';
		}

		if (this.state.running) {
			return 'running';
		}

		/**
		 * Clear the timeout to avoid start the callback.
		 */
		clearTimeout(this.state.timeoutID);

		try {
			this.state.operation.resolve(value as Awaited<T>);
		} finally {
			this.clear();
		}

		return 'resolved';
	}

	/**
	 * TODO: document the async flush method
	 * @summary Flush any pending operation immediately.
	 *
	 * @description
	 * this function is guaranteed to not be canceled by a DebouncerAbortError, since it
	 * will ensure that the callback is executed.
	 *
	 * ---
	 * @returns {Promise<DebounceFlushResult<Awaited<T>, E>>} flush result
	 */
	public async flush<E = unknown>(): Promise<DebounceFlushResult<Awaited<T>, E>> {
		if (!this.state) {
			return { type: 'none' };
		}

		if (!this.state.running) {
			// NOTE: clear the timeout if not running. So that it's possible to await
			// the operationFn without being canceled.
			// With the timeout being canceled,
			clearTimeout(this.state.timeoutID);

			try {
				/**
				 * NOTE: after awaiting the operationFn, the only possible way to cancel will
				 * be aborting the callback (possibly with {@link abort}), which the callback
				 * is responsible for handling this case (even if it means throwing an error,
				 * and resulting in a `{ type: 'error', ... }` from this function).
				 */
				const value = await this.state.operationFn();
				this.state.operation.resolve(value);
				return { type: 'ok', value };
			} catch (err: unknown) {
				this.state.operation.reject(err);
				return { type: 'error', value: err as E };
			} finally {
				this.clear();
			}
		}

		/**
		 * The timeout was reached and the callback is running.
		 * The only possible action is to await the operation promise and handle its execution.
		 */
		try {
			return { type: 'ok', value: await this.state.operation.promise };
		} catch (err: unknown) {
			return { type: 'error', value: err as E };
		} finally {
			this.clear();
		}
	}

	/**
	 * @summary Abort the debounce operation if the callback didn't started executing.
	 *
	 * @description
	 * TODO:
	 *
	 * ---
	 * @param reason reason for aborting the debounce
	 * @param options error options.
	 */
	public cancel<R = unknown>(reason?: R, options?: ErrorOptions): CancelDebounceAction {
		if (!this.state) {
			return 'noop';
		}

		if (this.state.running) {
			return 'running';
		}

		// NOTE: when the callback function is not running, it's sound to assume that the timeout was not reached.
		// In this case, it's correct to proceed with the following:
		// 1. cancel the timeout
		// 2. reject the promise with a DebouncerAbortError.
		clearTimeout(this.state.timeoutID);
		this.state.operation.reject(new DebouncerAbortError(reason, options));
		this.clear();

		return 'canceled';
	}

	/**
	 * @summary Abort the debounce operation even if the {@link callback} is executing.
	 *
	 * @description
	 * usefull with async callbacks (yields execution).
	 * this function will call the AbortController passed into the last {@link exec} function
	 * describe what happens if the callback fn is running xor if the delay time was not reached.
	 * TODO:
	 *
	 * ---
	 * @param reason reason for aborting the debounce
	 * @param options error options.
	 */
	public abort<R = unknown>(reason?: R, options?: ErrorOptions): AbortDebounceAction {
		if (!this.state) {
			return 'noop';
		}

		if (this.state.running) {
			// NOTE: if the callback function is running, send a abort event with the
			// AbortSignal token and return.
			this.state.controller.abort(reason);

			// NOTE: we must return here, since at this poiny, the callback is responsible
			// to handle this cancellation event.
			return 'aborted';
		}

		// NOTE: if the callback function didn't start, it means that the timeout was not reached.
		// In this case, is sound to do a "soft abort".
		// 1. cancel the timeout
		// 2. reject the promise with a DebouncerAbortError.
		clearTimeout(this.state.timeoutID);
		this.state.operation.reject(new DebouncerAbortError(reason, options));
		this.clear();

		return 'canceled';
	}

	public isExecuting(): boolean {
		return this.state?.running ?? false;
	}

	private makeTimeoutFn(): () => Promise<void> {
		return async () => {
			if (!this.state) {
				return;
			}

			try {
				this.state.operation.resolve(await this.state.operationFn());
			} catch (err: unknown) {
				this.state.operation.reject(err);
			} finally {
				this.clear();
			}
		};
	}

	private clear() {
		this.state = null;
	}

	private state: DebouncerState<T> | null = null;
}
