# Debouncer utils

Operation debouncer utility

## Features

- [Support for return values](#return-values)
- [Support for promises](#promises)
- [Support for cancelation](#cancelation)
- [Flexible API](#debounce-operation-control)
- Full typescript support

## Usage

Check out the [API docs](./docs/README.md) for more detailed information.

### Return values

The debounce return value can be reached by waiting the promise.

```ts
const result = await debounce.exec(arg1, arg2);
if (result.type === 'ok') {
	handleValue(result.value);
}
```

### Promises

Async debounce functions are also supported.

```ts
const debounce = new Debouncer(async () => 'success', 1_000);

// after 1 second ...
const result = await debounce.exec();

assert.strictEqual(result, { ok: 'ok', value: 'success' });
```

Also supports all the async utilities.

```ts
const debounce = new Debouncer(async () => 'first', 1_500);

// after 1.5 seconds ...
const values = await Promise.all(debounce.exec(), Promise.resolve('second'));

assert.strictEqual(values, [{ type: 'ok', value: 'first' }, 'second']);
```

### Cancelation

Cancelation can be triggered and handled safely.

```ts
const value = await debounce.exec(arg1, arg2);

// cancelExecution() ...

assert.strictEqual(result, { ok: 'abort', value: new DebounceAbortError() });

function cancelExecution() {
	// Abort pending operation
	debounce.abort();
}
```

### Debounce operation control

In case the return value is already available, its possible to skip the debounce execution.

```ts
async function func() {
	const value = await debounce.exec(arg1, arg2);
}

debounce.ready(value);
```

Instead of waiting the delay timeout, run the debounce immediately with `flush`.

```ts
async function func() {
	const value = await debounce.exec(arg1, arg2);
}

function resolveImmediate() {
	debounce.flush();
}
```

## Development

Clone the git repo and install with [pnpm](https://pnpm.io/).

### Test

To run the tests, use the package script `test` or `test --coverage` for code coverage.

See more options in the [jest CLI options](https://jestjs.io/docs/cli)

### Build

To build js files, run `build:js` and `build:type` for typescript declaration files.

For a full build (`.d.ts`, `.js`), run the build script.

## License

[MIT License](/LICENSE)
