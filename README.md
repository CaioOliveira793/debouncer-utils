# Debouncer utils

Operation debounce utility

## Features

- [Support for return values](#return-values)
- [Support for promises](#promises)
- [Support for cancelation](#cancelation)
- [Flexible API](#debounce-operation-control)
- Full typescript support

## Usage

<!-- TODO: add documentation (JSDoc & readme) -->

### Return values

```ts
const value = await debounce.exec(arg1, arg2);
```

### Promises

```ts
const debounce = new Debouncer(async () => 'success', 1_000);

// after 1 second ...
const value = await debounce.exec();

assert.strictEqual(value, 'success');
```


```ts
const debounce = new Debouncer(async () => 'first', 1_500);

// after 1.5 seconds ...
const values = await Promise.all(debounce.exec(), Promise.resolve('second'));

assert.strictEqual(values, ['first', 'second']);
```

### Cancelation

```ts
const value = await debounce.execSafeAbort(arg1, arg2);

// Abort pending operation
debounce.abort();
```

### Debounce operation control

```ts
async function func() {
	const value = await debounce.exec(arg1, arg2);
}

debounce.ready(value);
```

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
