[**debouncer-utils**](../README.md) • **Docs**

***

[debouncer-utils](../README.md) / CallbackContext

# Interface: CallbackContext

## Summary

Callback context

## Description

Context (*this*) bound to the Debouncer callback function when executed.

## Properties

### signal

> `readonly` **signal**: `AbortSignal`

#### Summary

AbortSignal

#### Description

Abort signal used to communicate the **async cancellation** from the
debouncer.

#### See

[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) documentation
on how to use it in your async function.

#### Source

[src/Type.ts:34](https://github.com/CaioOliveira793/debouncer-utils/blob/v0.2.0/src/Type.ts#L34)
