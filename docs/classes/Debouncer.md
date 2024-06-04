[**debouncer-utils**](../README.md) • **Docs**

***

[debouncer-utils](../README.md) / Debouncer

# Class: Debouncer\<Args, T\>

## Type parameters

• **Args** *extends* `unknown`[]

• **T**

## Constructors

### new Debouncer()

> **new Debouncer**\<`Args`, `T`\>(`callback`, `delay`): [`Debouncer`](Debouncer.md)\<`Args`, `T`\>

#### Parameters

• **callback**: [`Func`](../interfaces/Func.md)\<[`CallbackContext`](../interfaces/CallbackContext.md), `Args`, `T`\>

function to be debounced.

• **delay**: `number`

the debouncing delay in **milliseconds**.

#### Returns

[`Debouncer`](Debouncer.md)\<`Args`, `T`\>

#### Description

Instantiate a new [Debouncer](Debouncer.md) with a callback to be executed
and the delay time in **milliseconds**.

## Callback

The `callback` argument can be any js function (**sync** or **async**, **normal** or **arrow**), although there are
some limitations around those options.

- `normal` vs. `arrow`: A function created with the [`function` keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)
  can have it's context (`this`) modified after declaration, thus, allowing the Debouncer to pass it's [CallbackContext](../interfaces/CallbackContext.md)
  as the function *this*, giving support for async cancellation.

  In the case of an arrow function, the
  [context is fixed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#using_call_bind_and_apply)
  in the locality of it's declaration, so it's not possible to change the *this*, supplying a [CallbackContext](../interfaces/CallbackContext.md).
- `sync` vs. `async`: any type of synchronous function (`normal` or `arrow`) is fully supported. Once the callback starts running,
  there is no room to request for cancellation, so no [CallbackContext](../interfaces/CallbackContext.md) is needed.

  An asynchronous function that wants to support **async cancellation** will need a callback that can be provided with
  a [CallbackContext](../interfaces/CallbackContext.md), in this case, a [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)
  is required (`function () { .. }`).

### Callback context (`this`)

The callback function will have a different **this** when executed
([the CallbackContext type](../interfaces/CallbackContext.md)). *this* will have the `signal` property that can be used for
**async cancellation** with the [abort signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

Using an arrow function will prevent the *this* modification, limiting the [debounce.abort](Debouncer.md#abort) functionality.

---

#### Source

[src/Debouncer.ts:60](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L60)

## Properties

### callback

> `readonly` **callback**: [`Func`](../interfaces/Func.md)\<[`CallbackContext`](../interfaces/CallbackContext.md), `Args`, `T`\>

#### Description

Callback function.

#### Source

[src/Debouncer.ts:22](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L22)

***

### delay

> `readonly` **delay**: `number`

#### Description

Debouncer delay in milliseconds.

#### Source

[src/Debouncer.ts:18](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L18)

## Methods

### abort()

> **abort**\<`R`\>(`reason`?, `options`?): [`AbortAction`](../type-aliases/AbortAction.md)

#### Type parameters

• **R** = `unknown`

#### Parameters

• **reason?**: `R`

reason for aborting the debounce

• **options?**: `ErrorOptions`

error options.

---

#### Returns

[`AbortAction`](../type-aliases/AbortAction.md)

#### Summary

Abort a scheduled or running debounce operation.

#### Description

Abort any operation that was `scheduled` or is currently `running`.

## Abort action

When the [debounce state](../type-aliases/DebounceState.md) is `scheduled`, a [DebounceAbortError](DebounceAbortError.md) will be thrown,
removing the callback execution from schedule. This function will return the `canceled` [action](../type-aliases/AbortAction.md).

If the [state](../type-aliases/DebounceState.md) is `running`, an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
from the [CallbackContext](../interfaces/CallbackContext.md) will indicate that the operation was aborted. The returned [action](../type-aliases/AbortAction.md) will be `aborted`.

With an `idle` [state](../type-aliases/DebounceState.md), the resulting action will be `noop`.

---

#### Example

```
const action = debounce.abort();
switch (action) {
	case 'noop':
		// there is no operation to abort.
		// ...
		break;
	case 'canceled':
		// the scheduled operation was canceled.
		// ...
		break;
	case 'aborted':
		// the running operation was aborted.
		// ...
		break;
}
```

#### Source

[src/Debouncer.ts:455](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L455)

***

### cancel()

> **cancel**\<`R`\>(`reason`?, `options`?): [`CancelAction`](../type-aliases/CancelAction.md)

#### Type parameters

• **R** = `unknown`

#### Parameters

• **reason?**: `R`

reason for aborting the debounce

• **options?**: `ErrorOptions`

error options.

---

#### Returns

[`CancelAction`](../type-aliases/CancelAction.md)

#### Summary

Abort a scheduled debounce operation.

#### Description

Cancel any `scheduled` operation with a [DebounceAbortError](DebounceAbortError.md).

## Cancel action

The operation will only be canceled if the [debounce state](../type-aliases/DebounceState.md) is `scheduled`.

In case the [state](../type-aliases/DebounceState.md) is `idle` or `running` the resulting operation will
be `noop` or `running` respectively.

---

#### Example

```
const action = debounce.cancel('aborted due user request');
switch (action) {
	case 'noop':
		// there is no operation to cancel.
		// ...
		break;
	case 'running':
		// the callback is already running and can not be canceled.
		// ...
		break;
	case 'canceled':
		// the scheduled operation was canceled.
		// ...
		break;
}
```

#### Source

[src/Debouncer.ts:395](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L395)

***

### clear()

> `private` **clear**(): `void`

#### Returns

`void`

#### Source

[src/Debouncer.ts:502](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L502)

***

### exec()

> **exec**\<`E`\>(...`args`): `Promise`\<[`DebounceResult`](../type-aliases/DebounceResult.md)\<`Awaited`\<`T`\>, `E`\>\>

#### Type parameters

• **E** = `unknown`

#### Parameters

• ...**args**: `Args`

callback arguments.

#### Returns

`Promise`\<[`DebounceResult`](../type-aliases/DebounceResult.md)\<`Awaited`\<`T`\>, `E`\>\>

safe promise resulting the callback execution.

---

#### Summary

Execute the [callback](Debouncer.md#callback) function **debouncing** by the [delay](Debouncer.md#delay) amount
of **millisenconds**.

#### Description

This function **immediately returns** a promise that will resolve into a
[safe result](../type-aliases/DebounceResult.md) of the [callback](Debouncer.md#callback) execution.

## Debounce behavior

This function can have 3 behaviors depending of the [debounce state](../type-aliases/DebounceState.md)

### `idle`

Calling [exec](Debouncer.md#exec) when the debounce is **idle** will schedule a new execution
of the callback with the specified arguments. This will transition the
[debounce state](../type-aliases/DebounceState.md) to `scheduled`.

### `scheduled`

Running the [exec](Debouncer.md#exec) in a `scheduled` state will cancel the scheduled operation
and schedule a new execution of the callback with the current arguments. This will
**not transition** the [debounce state](../type-aliases/DebounceState.md).

### `running`

When [exec](Debouncer.md#exec) is called with a `running` [state](../type-aliases/DebounceState.md), the operation
already running will be prioritized, meaning that the current [exec](Debouncer.md#exec) call will not
be scheduled.

The returned promise will be the same from the previous [callback](Debouncer.md#callback) execution.

## Return value

The returned promise can be resolved in one of 3 ways:

- 'ok': the callback executed completly without any exception being thrown.
- 'error': the callback has thrown an exception.
- 'abort': the debounce operation was aborted.

#### See

[DebounceResult](../type-aliases/DebounceResult.md) for more information about the type.

---

#### Example

```
const result = debounce.exec<EType>(arg1, arg2, arg3);
switch (result.type) {
	case 'ok': {
		// handle the callback return value
		doSomething(result.value); // value is T
		break;
	}
	case 'abort': {
		// handle the aborted debounced operation
		handleCancelation(result.value); // value is DebouncerAbortError
		break;
	}
	case 'error': {
		// handle the callback exception
		handleError(result.value); // value is EType or unknown by default
		break;
	}
}
```

#### Source

[src/Debouncer.ts:211](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L211)

***

### execUnsafe()

> **execUnsafe**(...`args`): `Promise`\<`Awaited`\<`T`\>\>

#### Parameters

• ...**args**: `Args`

callback arguments.

#### Returns

`Promise`\<`Awaited`\<`T`\>\>

promise of the callback execution.

#### Summary

Execute the [callback](Debouncer.md#callback) function **debouncing** by the [delay](Debouncer.md#delay) amount
of **millisenconds**.

#### Description

This function will **immediately return** a promise to be awaited for a fulfilment or
rejection of the [callback](Debouncer.md#callback) execution.

## Debounce behavior

This function can have 3 behaviors depending of the [debounce state](../type-aliases/DebounceState.md)

### `idle`

Calling [exec](Debouncer.md#exec) when the debounce is **idle** will schedule a new execution
of the callback with the specified arguments. This will transition the
[debounce state](../type-aliases/DebounceState.md) to `scheduled`.

### `scheduled`

Running the [exec](Debouncer.md#exec) in a `scheduled` state will cancel the scheduled operation
and schedule a new execution of the callback with the current arguments. This will
**not transition** the [debounce state](../type-aliases/DebounceState.md).

### `running`

When [exec](Debouncer.md#exec) is called with a `running` [state](../type-aliases/DebounceState.md), the operation
already running will be prioritized, meaning that the current [exec](Debouncer.md#exec) call will not
be scheduled.

The returned promise will be the same from the previous [callback](Debouncer.md#callback) execution.

## Safety

Is **strongly advised** to await this promise, since aborted operations or any exception
thrown from the [callback](Debouncer.md#callback) function will cause a **Unhandled promise rejection**.

#### See

 - [exec](Debouncer.md#exec) for a safer version of this function.
 - [NodeJS unhandled rejection event](https://nodejs.org/api/process.html#event-unhandledrejection) for a NodeJS environment.
 - [Window unhandled rejection event](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event) for a Browser environment.

---

#### Throws

a [debouncer abort error](DebounceAbortError.md) or any error thrown by the [callback](Debouncer.md#callback) function.

---

#### Example

```
try {
	const returnValue = await debounce.execUnsafe(arg1, arg2, arg3);
} catch (err: unknown) {
	// handle any error thrown by the debounced callback ...
	console.error(err);
}
```

#### Source

[src/Debouncer.ts:122](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L122)

***

### flush()

> **flush**\<`E`\>(): `Promise`\<[`FlushResult`](../type-aliases/FlushResult.md)\<`Awaited`\<`T`\>, `E`\>\>

#### Type parameters

• **E** = `unknown`

#### Returns

`Promise`\<[`FlushResult`](../type-aliases/FlushResult.md)\<`Awaited`\<`T`\>, `E`\>\>

flush result

---

#### Summary

Flush any scheduled operation immediately.

#### Description

Take any `scheduled` or `running` operation and immediately waits the [callback](Debouncer.md#callback)
execution.

This function is **guaranteed** to not be canceled by a [DebounceAbortError](DebounceAbortError.md), since it
will ensure that the [callback](Debouncer.md#callback) is executed.

---

#### Example

```
const result = await debounce.flush();
switch (result.type) {
	case 'none':
		// there is no operation to debounce
		// ...
		break;
	case 'error':
		// the callback has thrown an error
		handleError(result.value);
		break;
	case 'ok':
		// the callback was successfully executed.
		handleValue(result.value);
		break;
}
```

#### Source

[src/Debouncer.ts:316](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L316)

***

### makeTimeoutFn()

> `private` **makeTimeoutFn**(): () => `Promise`\<`void`\>

#### Returns

`Function`

##### Returns

`Promise`\<`void`\>

#### Source

[src/Debouncer.ts:486](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L486)

***

### ready()

> **ready**(`value`): [`ReadyAction`](../type-aliases/ReadyAction.md)

#### Parameters

• **value**: `T`

callback return value

#### Returns

[`ReadyAction`](../type-aliases/ReadyAction.md)

resulting action

---

#### Summary

Take any scheduled operation and finish immediately with its return value.

#### Description

Immediately finish any `scheduled` operation providing the [callback](Debouncer.md#callback) return value.

## Ready action

Calling [ready](Debouncer.md#ready) will only take action if the [debounce state](../type-aliases/DebounceState.md)
is `scheduled`.

In case the [state](../type-aliases/DebounceState.md) is `idle` or `running` the resulting operation will
be `noop` or `running` respectively.

---

#### Example

```
const action = debounce.ready(callbackReturnValue);
switch (action) {
	case 'noop':
		// there is no scheduled operation to debounce
		// ...
		break;
	case 'running':
		// the debounce operation is already running
		// ...
		break;
	case 'resolved':
		// the debounce operation was resolved with the provided value.
		// ...
		break;
}
```

#### Source

[src/Debouncer.ts:260](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L260)

***

### state()

> **state**(): [`DebounceState`](../type-aliases/DebounceState.md)

#### Returns

[`DebounceState`](../type-aliases/DebounceState.md)

#### Source

[src/Debouncer.ts:480](https://github.com/CaioOliveira793/debouncer-utils/blob/0e92308b2a5ad95ff3e77bc26245f15699f57079/src/Debouncer.ts#L480)
