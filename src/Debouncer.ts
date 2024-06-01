import type {
	CallbackContext,
	Func,
	DebounceResult,
	ReadyAction,
	FlushResult,
	CancelAction,
	AbortAction,
	DebounceState,
} from '@/Type';
import { DebounceAbortError } from '@/AbortError';
import { makeDebounceInternals, updateOperationFn, type DebounceInternals } from '@/State';

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
	 * ## Debounce behavior
	 *
	 * This function can have 3 behaviors depending of the {@link DebounceState debounce state}
	 *
	 * ### `idle`
	 *
	 * Calling {@link exec} when the debounce is **idle** will schedule a new execution
	 * of the callback with the specified arguments. This will transition the
	 * {@link DebounceState debounce state} to `pending`.
	 *
	 * ### `pending`
	 *
	 * Running the {@link exec} in a `pending` state will cancel the scheduled operation
	 * and schedule a new execution of the callback with the current arguments. This will
	 * **not transition** the {@link DebounceState debounce state}.
	 *
	 * ### `running`
	 *
	 * When {@link exec} is called with a `running` {@link DebounceState state}, the operation
	 * already running will be prioritized, meaning that the current {@link exec} call will not
	 * be scheduled.
	 *
	 * The returned promise will be the same from the previous {@link callback} execution.
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
	 * @throws a {@link DebounceAbortError debouncer abort error} or any error thrown by the {@link callback} function.
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
		if (this.internals?.running) {
			return this.internals.operation.promise;
		}

		if (!this.internals) {
			this.internals = makeDebounceInternals(this.callback, ...args);
			this.internals.timeoutID = setTimeout(this.makeTimeoutFn(), this.delay) as unknown as number;

			return this.internals.operation.promise;
		}

		clearTimeout(this.internals.timeoutID);
		updateOperationFn(this.internals, this.callback, ...args);

		this.internals.timeoutID = setTimeout(this.makeTimeoutFn(), this.delay) as unknown as number;

		return this.internals.operation.promise;
	}

	/**
	 * @summary Execute the {@link callback} function **debouncing** by the {@link delay} amount
	 * of **millisenconds**.
	 *
	 * @description
	 * This function **immediately returns** a promise that will resolve into a
	 * {@link DebounceResult safe result} of the {@link callback} execution.
	 *
	 * ## Debounce behavior
	 *
	 * This function can have 3 behaviors depending of the {@link DebounceState debounce state}
	 *
	 * ### `idle`
	 *
	 * Calling {@link exec} when the debounce is **idle** will schedule a new execution
	 * of the callback with the specified arguments. This will transition the
	 * {@link DebounceState debounce state} to `pending`.
	 *
	 * ### `pending`
	 *
	 * Running the {@link exec} in a `pending` state will cancel the scheduled operation
	 * and schedule a new execution of the callback with the current arguments. This will
	 * **not transition** the {@link DebounceState debounce state}.
	 *
	 * ### `running`
	 *
	 * When {@link exec} is called with a `running` {@link DebounceState state}, the operation
	 * already running will be prioritized, meaning that the current {@link exec} call will not
	 * be scheduled.
	 *
	 * The returned promise will be the same from the previous {@link callback} execution.
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
			if (err instanceof DebounceAbortError) {
				return { type: 'abort', value: err };
			}
			return { type: 'error', value: err as E };
		}
	}

	/**
	 * @summary Take any pending operation and finish immediately with its return value.
	 *
	 * @description
	 * Immediately finish any `scheduled` operation providing the {@link callback} return value.
	 *
	 * ## Ready action
	 *
	 * Calling {@link ready} will only take action if the {@link DebounceState debounce state}
	 * is `scheduled`.
	 *
	 * In case the {@link DebounceState state} is `idle` or `running` the resulting operation will
	 * be `noop` or `running` respectively.
	 *
	 * ---
	 * @param {T} value callback return value
	 * @returns {ReadyAction} resulting action
	 *
	 * ---
	 * @example
	 * ```
	 * const action = debounce.ready(callbackReturnValue);
	 * switch (action) {
	 * 	case 'noop':
	 * 		// there is no pending operation to debounce
	 * 		// ...
	 * 		break;
	 * 	case 'running':
	 * 		// the debounce operation is already running
	 * 		// ...
	 * 		break;
	 * 	case 'resolved':
	 * 		// the debounce operation was resolved with the provided value.
	 * 		// ...
	 * 		break;
	 * }
	 * ```
	 */
	public ready(value: T): ReadyAction {
		if (!this.internals) {
			return 'noop';
		}

		if (this.internals.running) {
			return 'running';
		}

		/**
		 * Clear the timeout to avoid start the callback.
		 */
		clearTimeout(this.internals.timeoutID);

		try {
			this.internals.operation.resolve(value as Awaited<T>);
		} finally {
			this.clear();
		}

		return 'resolved';
	}

	/**
	 * @summary Flush any pending operation immediately.
	 *
	 * @description
	 * Take any `scheduled` or `running` operation and immediately waits the {@link callback}
	 * execution.
	 *
	 * This function is **guaranteed** to not be canceled by a {@link DebounceAbortError}, since it
	 * will ensure that the {@link callback} is executed.
	 *
	 * ---
	 * @returns {Promise<FlushResult<Awaited<T>, E>>} flush result
	 *
	 * ---
	 * @example
	 * ```
	 * const result = await debounce.flush();
	 * switch (result.type) {
	 * 	case 'none':
	 * 		// there is no operation to debounce
	 * 		// ...
	 * 		break;
	 * 	case 'error':
	 * 		// the callback has thrown an error
	 * 		handleError(result.value);
	 * 		break;
	 * 	case 'ok':
	 * 		// the callback was successfully executed.
	 * 		handleValue(result.value);
	 * 		break;
	 * }
	 * ```
	 */
	public async flush<E = unknown>(): Promise<FlushResult<Awaited<T>, E>> {
		if (!this.internals) {
			return { type: 'none' };
		}

		if (!this.internals.running) {
			// Clear the timeout if not running. So that it's possible to await
			// the operationFn without being canceled.
			// With the timeout being canceled,
			clearTimeout(this.internals.timeoutID);

			try {
				/**
				 * After awaiting the operationFn, the only possible way to cancel will
				 * be aborting the callback (possibly with {@link abort}), which the callback
				 * is responsible for handling this case (even if it means throwing an error,
				 * and resulting in a `{ type: 'error', ... }` from this function).
				 */
				const value = await this.internals.operationFn();
				this.internals.operation.resolve(value);
				return { type: 'ok', value };
			} catch (err: unknown) {
				this.internals.operation.reject(err);
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
			return { type: 'ok', value: await this.internals.operation.promise };
		} catch (err: unknown) {
			return { type: 'error', value: err as E };
		} finally {
			this.clear();
		}
	}

	/**
	 * @summary Abort a scheduled debounce operation.
	 *
	 * @description
	 * Cancel any `scheduled` operation with a {@link DebounceAbortError}.
	 *
	 * ## Cancel action
	 *
	 * The operation will only be canceled if the {@link DebounceState debounce state} is `scheduled`.
	 *
	 * In case the {@link DebounceState state} is `idle` or `running` the resulting operation will
	 * be `noop` or `running` respectively.
	 *
	 * ---
	 * @param {R} [reason] - reason for aborting the debounce
	 * @param {ErrorOptions} [options] - error options.
	 *
	 * ---
	 * @example
	 * ```
	 * const action = debounce.cancel('aborted due user request');
	 * switch (action) {
	 * 	case 'noop':
	 * 		// there is no operation to cancel.
	 * 		// ...
	 * 		break;
	 * 	case 'running':
	 * 		// the callback is already running and can not be canceled.
	 * 		// ...
	 * 		break;
	 * 	case 'canceled':
	 * 		// the scheduled operation was canceled.
	 * 		// ...
	 * 		break;
	 * }
	 * ```
	 */
	public cancel<R = unknown>(reason?: R, options?: ErrorOptions): CancelAction {
		if (!this.internals) {
			return 'noop';
		}

		if (this.internals.running) {
			return 'running';
		}

		// When the callback function is not running, it's sound to assume that the timeout was not reached.
		// In this case, it's correct to proceed with the following:
		// 1. cancel the timeout
		// 2. reject the promise with a DebouncerAbortError.
		clearTimeout(this.internals.timeoutID);
		this.internals.operation.reject(new DebounceAbortError(reason, options));
		this.clear();

		return 'canceled';
	}

	/**
	 * @summary Abort a scheduled or running debounce operation.
	 *
	 * @description
	 * Abort any operation that was `scheduled` or is currently `running`.
	 *
	 * ## Abort action
	 *
	 * When the {@link DebounceState debounce state} is `scheduled`, a {@link DebounceAbortError} will be thrown,
	 * removing the callback execution from schedule. This function will return the `canceled` {@link AbortAction action}.
	 *
	 * If the {@link DebounceState state} is `running`, an {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal AbortSignal}
	 * from the {@link CallbackContext} will indicate that the operation was aborted. The returned {@link AbortAction action} will be `aborted`.
	 *
	 * With an `idle` {@link DebounceState state}, the resulting action will be `noop`.
	 *
	 * ---
	 * @param {R} [reason] - reason for aborting the debounce
	 * @param {ErrorOptions} [options] - error options.
	 *
	 * ---
	 * @example
	 * ```
	 * const action = debounce.abort();
	 * switch (action) {
	 * 	case 'noop':
	 * 		// there is no operation to abort.
	 * 		// ...
	 * 		break;
	 * 	case 'canceled':
	 * 		// the scheduled operation was canceled.
	 * 		// ...
	 * 		break;
	 * 	case 'aborted':
	 * 		// the running operation was aborted.
	 * 		// ...
	 * 		break;
	 * }
	 * ```
	 */
	public abort<R = unknown>(reason?: R, options?: ErrorOptions): AbortAction {
		if (!this.internals) {
			return 'noop';
		}

		if (this.internals.running) {
			// If the callback function is running, send a abort event with the
			// AbortSignal token and return.
			this.internals.controller.abort(reason);

			// The callback is responsible to handle this cancellation event. Nothing more to do.
			return 'aborted';
		}

		// If the callback function didn't start, it means that the timeout was not reached.
		// In this case, is sound to do a "soft abort".
		// 1. cancel the timeout
		// 2. reject the promise with a DebouncerAbortError.
		clearTimeout(this.internals.timeoutID);
		this.internals.operation.reject(new DebounceAbortError(reason, options));
		this.clear();

		return 'canceled';
	}

	public state(): DebounceState {
		if (!this.internals) return 'idle';

		return this.internals.running ? 'running' : 'scheduled';
	}

	private makeTimeoutFn(): () => Promise<void> {
		return async () => {
			if (!this.internals) {
				return;
			}

			try {
				this.internals.operation.resolve(await this.internals.operationFn());
			} catch (err: unknown) {
				this.internals.operation.reject(err);
			} finally {
				this.clear();
			}
		};
	}

	private clear() {
		this.internals = null;
	}

	private internals: DebounceInternals<T> | null = null;
}
