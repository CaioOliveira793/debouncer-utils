[**debouncer-utils**](../README.md) • **Docs**

***

[debouncer-utils](../README.md) / DebounceAbortError

# Class: DebounceAbortError\<R\>

## Extends

- `Error`

## Type parameters

• **R** = `unknown`

## Constructors

### new DebounceAbortError()

> **new DebounceAbortError**\<`R`\>(`reason`?, `options`?): [`DebounceAbortError`](DebounceAbortError.md)\<`R`\>

#### Parameters

• **reason?**: `R`

• **options?**: `ErrorOptions`

#### Returns

[`DebounceAbortError`](DebounceAbortError.md)\<`R`\>

#### Overrides

`Error.constructor`

#### Source

[src/AbortError.ts:4](https://github.com/CaioOliveira793/debouncer-utils/blob/v0.2.0/src/AbortError.ts#L4)

## Properties

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

`Error.cause`

#### Source

node\_modules/.pnpm/typescript@5.4.5/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

***

### message

> **message**: `string`

#### Inherited from

`Error.message`

#### Source

node\_modules/.pnpm/typescript@5.4.5/node\_modules/typescript/lib/lib.es5.d.ts:1077

***

### name

> **name**: `string`

#### Inherited from

`Error.name`

#### Source

node\_modules/.pnpm/typescript@5.4.5/node\_modules/typescript/lib/lib.es5.d.ts:1076

***

### reason?

> `optional` `readonly` **reason**: `R`

#### Source

[src/AbortError.ts:2](https://github.com/CaioOliveira793/debouncer-utils/blob/v0.2.0/src/AbortError.ts#L2)

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

#### Source

node\_modules/.pnpm/typescript@5.4.5/node\_modules/typescript/lib/lib.es5.d.ts:1078

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Optional override for formatting stack traces

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Parameters

• **err**: `Error`

• **stackTraces**: `CallSite`[]

#### Returns

`any`

#### Inherited from

`Error.prepareStackTrace`

#### Source

node\_modules/.pnpm/@types+node@20.12.12/node\_modules/@types/node/globals.d.ts:28

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`Error.stackTraceLimit`

#### Source

node\_modules/.pnpm/@types+node@20.12.12/node\_modules/@types/node/globals.d.ts:30

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

Create .stack property on a target object

#### Parameters

• **targetObject**: `object`

• **constructorOpt?**: `Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`

#### Source

node\_modules/.pnpm/@types+node@20.12.12/node\_modules/@types/node/globals.d.ts:21
