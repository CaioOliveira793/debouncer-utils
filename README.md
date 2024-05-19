# Debouncer utils

Operation debouncer utility

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
const debouncer = new Debouncer(async () => 'success', 1_000);

// after 1 second ...
const value = await debouncer.exec();

assert.strictEqual(value, 'success');
```


```ts
const debouncer = new Debouncer(async () => 'first', 1_500);

// after 1.5 seconds ...
const values = await Promise.all(debouncer.exec(), Promise.resolve('second'));

assert.strictEqual(values, ['first', 'second']);
```

### Cancelation

```ts
const value = await debounce.execSafeAbort(arg1, arg2);

// Abort pending operation
debouncer.abort();
```

### Debounce operation control

```ts
async function func() {
	const value = await debounce.exec(arg1, arg2);
}

debouncer.ready(value);
```

```ts
async function func() {
	const value = await debounce.exec(arg1, arg2);
}

function resolveImmediate() {
	debouncer.flush();
}
```

## Development

Clone the git repo and install with [pnpm](https://pnpm.io/).

### Test

<!-- TODO: add tests -->
<!-- TODO: testing -->

### Build

To build the js files, run `build:js` and `build:type` for typescript declaration files.

For a full build (`.d.ts`, `.js`), run the build script.

## License

[MIT License](/LICENSE)
