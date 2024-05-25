import { type PromiseObj, makePromiseObj } from '@/util/Promise';
import type { CallbackContext, Func } from '@/Type';

function makeCallbackContext(controller: AbortController): CallbackContext {
	return { signal: controller.signal };
}

export type OperationFn<T> = Func<DebouncerState<T>, [], Promise<T>>;

export interface DebouncerState<T> {
	running: boolean;
	operationFn: OperationFn<T>;
	operation: PromiseObj<Awaited<T>>;
	controller: AbortController;
	timeoutID: number;
}

export function initialDebouncerState<T, Args extends Array<unknown>>(
	callback: Func<CallbackContext, Args, T>,
	...args: Args
): DebouncerState<T> {
	const state: DebouncerState<T> = {
		timeoutID: 0,
		controller: new AbortController(),
		running: false,
		operation: makePromiseObj<Awaited<T>>(),
		operationFn: async () => {
			try {
				state.running = true;
				return await callback.call(makeCallbackContext(state.controller), ...args);
			} finally {
				state.running = false;
			}
		},
	};

	return state;
}

export function updateOperationFn<T, Args extends Array<unknown>>(
	state: DebouncerState<T>,
	callback: Func<CallbackContext, Args, T>,
	...args: Args
) {
	state.operationFn = async () => {
		try {
			state.running = true;
			return await callback.call(makeCallbackContext(state.controller), ...args);
		} finally {
			state.running = false;
		}
	};
}
