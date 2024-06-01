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
 * TODO: document callback context
 */
export interface CallbackContext {
	readonly signal: AbortSignal;
}

/**
 * TODO: document debounce state
 */
export type DebounceState = 'idle' | 'scheduled' | 'running';

/**
 * TODO: document ready action
 */
export type ReadyAction = 'noop' | 'resolved' | 'running';

/**
 * TODO: document cancel action
 */
export type CancelAction = 'noop' | 'canceled' | 'running';

/**
 * TODO: document abort action
 */
export type AbortAction = 'noop' | 'canceled' | 'aborted';
