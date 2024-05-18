import { DebouncerAbortError, resolveDebouncerAbort } from '@/AbortError';
import { PromiseObj, makePromiseObj } from '@/util/Promise';

export interface Func<This, Args extends Array<unknown>, Return> {
	(this: This, ...args: Args): Return;
}

// NOTE: take into account the calling context e.g. this
export class Debouncer<Args extends Array<unknown>, T> {
	/**
	 * Delay (in milliseconds)
	 */
	public readonly delay: number;
	/**
	 * Callback function
	 */
	public readonly callback: Func<null, Args, T>;

	public constructor(callback: Func<null, Args, T>, delay: number) {
		this.callback = callback;
		this.delay = delay;
	}

	public exec(...args: Args): Promise<Awaited<T>> {
		clearTimeout(this.timeoutID);
		this.lastFn = () => this.callback.call(null, ...args);

		if (this.promiseObj === null) {
			this.promiseObj = makePromiseObj();
		}

		this.timeoutID = setTimeout(() => {
			try {
				this.promiseObj?.resolve(this.lastFn?.() as Awaited<T>);
			} catch (err: unknown) {
				this.promiseObj?.reject(err);
			} finally {
				this.clear();
			}
		}, this.delay) as unknown as number;

		return this.promiseObj.promise;
	}

	public async execSafeAbort(...args: Args): Promise<Awaited<T> | DebouncerAbortError> {
		try {
			return await this.exec(...args);
		} catch (error) {
			return resolveDebouncerAbort(error);
		}
	}

	public ready(value: T): void {
		clearTimeout(this.timeoutID);
		this.promiseObj?.resolve(value as Awaited<T>);
		this.clear();
	}

	public flush(): T | void {
		clearTimeout(this.timeoutID);
		try {
			const value = this.lastFn?.();
			this.promiseObj?.resolve(value as Awaited<T>);
			return value;
		} finally {
			this.clear();
		}
	}

	public abort<R = unknown>(reason?: R, options?: ErrorOptions): void {
		clearTimeout(this.timeoutID);
		this.promiseObj?.reject(new DebouncerAbortError(reason, options));
		this.clear();
	}

	private clear() {
		this.lastFn = null;
		this.promiseObj = null;
		this.timeoutID = 0;
	}

	private lastFn: Func<typeof this, [], T> | null = null;
	private promiseObj: PromiseObj<Awaited<T>> | null = null;
	private timeoutID: number = 0;
}
