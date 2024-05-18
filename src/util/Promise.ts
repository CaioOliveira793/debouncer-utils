export interface PromiseResolve<T> {
	(value: T | PromiseLike<T>): void;
}

export interface PromiseReject {
	(reason?: unknown): void;
}

export interface PromiseObj<T> {
	promise: Promise<T>;
	resolve: PromiseResolve<T>;
	reject: PromiseReject;
}

// TODO: use Promise.withResolvers() when widely available (Browser & NodeJS LTS - 2 versions)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
export function makePromiseObj<T>(): PromiseObj<T> {
	let resolve, reject;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject } as unknown as PromiseObj<T>;
}
