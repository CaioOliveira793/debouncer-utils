[**debouncer-utils**](../README.md) • **Docs**

***

[debouncer-utils](../README.md) / resolveAbortError

# Function: resolveAbortError()

> **resolveAbortError**\<`Err`, `R`\>(`error`): [`DebounceAbortError`](../classes/DebounceAbortError.md)\<`R`\>

## Type parameters

• **Err** = `unknown`

• **R** = `unknown`

## Parameters

• **error**: `Err`

unknown error

## Returns

[`DebounceAbortError`](../classes/DebounceAbortError.md)\<`R`\>

debounce abort error

## Description

Resolve debounce abort error.

Return the error if it is a [DebounceAbortError](../classes/DebounceAbortError.md) and throw it otherwise.

---

## Throws

unknown error that is not a debounce abort error.
---

## Example

```
const result: T | DebounceAbortError = await debounce.exec()
	.catch(resolveAbortError)
	.catch(err => {
		// handle some other error ...
	});
```

## Source

[src/AbortError.ts:32](https://github.com/CaioOliveira793/debouncer-utils/blob/v0.2.0/src/AbortError.ts#L32)
