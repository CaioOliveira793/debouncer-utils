import type { OkResult, ErrorResult, None } from '@/lib';
import type { DebouncerAbortError } from '@/AbortError';

export interface DebouncerAbortResult {
	type: 'abort';
	value: DebouncerAbortError;
}

export type DebounceResult<T, E = unknown> = OkResult<T> | ErrorResult<E> | DebouncerAbortResult;

export type DebounceFlushResult<T, E = unknown> = OkResult<T> | ErrorResult<E> | None;

export interface Func<This, Args extends Array<unknown>, Return> {
	(this: This, ...args: Args): Return;
}

export interface CallbackContext {
	readonly signal: AbortSignal;
}

/**
 * TODO: document ready action
 */
export type ReadyDebounceAction = 'noop' | 'resolved' | 'running';

/**
 * TODO: document cancel action
 */
export type CancelDebounceAction = 'noop' | 'canceled' | 'running';

/**
 * TODO: document abort action
 */
export type AbortDebounceAction = 'noop' | 'canceled' | 'aborted';
