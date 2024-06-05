[**debouncer-utils**](../README.md) • **Docs**

***

[debouncer-utils](../README.md) / DebounceState

# Type alias: DebounceState

> **DebounceState**: `"idle"` \| `"scheduled"` \| `"running"`

## Summary

Debounce state

## Description

A Debouncer can assume one of 3 different states, which dictate the behavior of the it's methods.

## Variants

There are 3 variants, all of these can be observed during the debounce execution.

### `idle`

The debouncer does not have received any request for execution, neither is running the
callback. In this state, nothing will happen unless a new execution is requested,
transitioning the state to `scheduled`.

It's the **default** state once instantiated.

### `scheduled`

Once the debouncer has received a request for execution, it will transition into the
`scheduled` state. When the callback eventually start, the state will be transitioned
to `running`, and in case the schedule is cancelled, the state is going to return to
`idle`.

### `running`

When the callback starts, the state will be transitioned to `running`. Once it finish
executing (either successfully or until cancelled) the state is transitioned to `idle`.

## Source

[src/Type.ts:67](https://github.com/CaioOliveira793/debouncer-utils/blob/v0.2.0/src/Type.ts#L67)
