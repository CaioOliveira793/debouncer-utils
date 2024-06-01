import { type PromiseObj, makePromiseObj } from '@/util/Promise';
import type { CallbackContext, Func } from '@/Type';

export type OperationFn<T> = Func<DebounceInternals<T>, [], Promise<T>>;

export interface DebounceInternals<T> {
	running: boolean;
	operationFn: OperationFn<T>;
	operation: PromiseObj<Awaited<T>>;
	controller: AbortController;
	timeoutID: number;
}

export function makeDebounceInternals<T, Args extends Array<unknown>>(
	callback: Func<CallbackContext, Args, T>,
	...args: Args
): DebounceInternals<T> {
	const state: DebounceInternals<T> = {
		timeoutID: 0,
		controller: new AbortController(),
		running: false,
		operation: makePromiseObj<Awaited<T>>(),
		operationFn: async () => {
			try {
				state.running = true;
				return await callback.call({ signal: state.controller.signal }, ...args);
			} finally {
				state.running = false;
			}
		},
	};

	return state;
}

export function updateOperationFn<T, Args extends Array<unknown>>(
	state: DebounceInternals<T>,
	callback: Func<CallbackContext, Args, T>,
	...args: Args
) {
	state.operationFn = async () => {
		try {
			state.running = true;
			return await callback.call({ signal: state.controller.signal }, ...args);
		} finally {
			state.running = false;
		}
	};
}
