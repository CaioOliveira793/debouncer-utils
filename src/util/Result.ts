// TODO: document types
// TODO: extract to other library `result-utils`

export interface Some<T> {
	type: 'some';
	value: T;
}

export interface None {
	type: 'none';
}

export type Option<T> = Some<T> | None;

export interface OkResult<T> {
	type: 'ok';
	value: T;
}

export interface ErrorResult<E = unknown> {
	type: 'error';
	value: E;
}

export interface UnknownResult<U = unknown> {
	type: 'unknown';
	value: U;
}

export interface AnyResult {
	type: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any;
}

export function throwIfError<
	Res extends Other | ErrorResult<E>,
	Other extends AnyResult,
	E = unknown,
>(result: Res): Other {
	if (result.type === 'error') {
		throw result.value;
	}
	return result as Other;
}

export function okToSome<Res extends Other | OkResult<T>, Other extends AnyResult, T>(
	result: Res
): Option<T> {
	if (result.type === 'ok') {
		return { type: 'some', value: result.value };
	}
	return { type: 'none' };
}

export function boolToOption<T>(value?: T | null): Option<T> {
	if (value) {
		return { type: 'some', value };
	}
	return { type: 'none' };
}
