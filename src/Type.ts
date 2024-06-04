import type { OkResult, ErrorResult, None } from '@/util/Result';
import type { DebounceAbortError } from '@/AbortError';

export interface Func<This, Args extends Array<unknown>, Return> {
	(this: This, ...args: Args): Return;
}

export interface AbortResult {
	type: 'abort';
	value: DebounceAbortError;
}

export type DebounceResult<T, E = unknown> = OkResult<T> | ErrorResult<E> | AbortResult;

export type FlushResult<T, E = unknown> = OkResult<T> | ErrorResult<E> | None;

/**
 * @summary Callback context
 *
 * @description
 * Context (*this*) bound to the Debouncer callback function when executed.
 */
export interface CallbackContext {
	/**
	 * @summary AbortSignal
	 *
	 * @description
	 * Abort signal used to communicate the **async cancellation** from the
	 * debouncer.
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal AbortSignal} documentation
	 * on how to use it in your async function.
	 */
	readonly signal: AbortSignal;
}

/**
 * @summary Debounce state
 *
 * @description
 * A Debouncer can assume one of 3 different states, which dictate the behavior of the it's methods.
 *
 * ## Variants
 *
 * There are 3 variants, all of these can be observed during the debounce execution.
 *
 * ### `idle`
 *
 * The debouncer does not have received any request for execution, neither is running the
 * callback. In this state, nothing will happen unless a new execution is requested,
 * transitioning the state to `scheduled`.
 *
 * It's the **default** state once instantiated.
 *
 * ### `scheduled`
 *
 * Once the debouncer has received a request for execution, it will transition into the
 * `scheduled` state. When the callback eventually start, the state will be transitioned
 * to `running`, and in case the schedule is cancelled, the state is going to return to
 * `idle`.
 *
 * ### `running`
 *
 * When the callback starts, the state will be transitioned to `running`. Once it finish
 * executing (either successfully or until cancelled) the state is transitioned to `idle`.
 */
export type DebounceState = 'idle' | 'scheduled' | 'running';

export type ReadyAction = 'noop' | 'resolved' | 'running';

export type CancelAction = 'noop' | 'canceled' | 'running';

export type AbortAction = 'noop' | 'canceled' | 'aborted';
