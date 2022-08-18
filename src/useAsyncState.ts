import { useReducer, useCallback, useMemo, Reducer } from 'react';

export enum StateType {
  INITIAL = 'INITIAL',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

type ReducerState<V, E> = {
  origin?: string; // identification of the value/error source
  state: StateType;
  value?: V;
  error?: E;
};

const initialState = {
  origin: undefined,
  state: StateType.INITIAL,
  value: undefined,
  error: undefined,
};

enum ActionType {
  START = 'START',
  RESOLVE = 'RESOLVE',
  REJECT = 'REJECT',
  RESET = 'RESET',
}

type Action<V, E> =
  | {
      type: ActionType.START;
      origin?: string;
    }
  | {
      origin?: string;
      type: ActionType.RESOLVE;
      value?: V;
    }
  | {
      origin?: string;
      type: ActionType.REJECT;
      error?: E;
    }
  | {
      type: ActionType.RESET;
    };

const reducer = <V, E>(state: ReducerState<V, E>, action: Action<V, E>) => {
  const { type } = action;

  switch (type) {
    case ActionType.START:
      return {
        ...state,
        state: StateType.PENDING,
        origin: action.origin,
        // the value and error remain unchanged
      };

    case ActionType.RESOLVE:
      return {
        ...state,
        state: StateType.RESOLVED,
        value: action.value,
        error: undefined,
        // keep state.origin when action.origin is undefined
        origin: action.origin ?? state.origin,
      };

    case ActionType.REJECT:
      return {
        ...state,
        state: StateType.REJECTED,
        value: undefined,
        error: action.error,
        // keep state.origin when action.origin is undefined
        origin: action.origin ?? state.origin,
      };

    case ActionType.RESET:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export function useAsyncState<V, E>() {
  const [reducerState, dispatch] = useReducer<Reducer<ReducerState<V, E>, Action<V, E>>>(
    reducer,
    initialState,
  );

  const start = useCallback((origin?: string) => {
    dispatch({ type: ActionType.START, origin });
  }, []);

  /**
   * Sets new state value. Keeps state.origin when origin is undefined.
   */
  const resolve = useCallback((value: V, origin?: string) => {
    dispatch({ type: ActionType.RESOLVE, value, origin });
  }, []);

  /**
   * Sets new state error. Keeps state.origin when origin is undefined.
   */
  const reject = useCallback((error: E, origin?: string) => {
    dispatch({ type: ActionType.REJECT, error, origin });
  }, []);

  /**
   * Resets to initial state, clears value and error.
   */
  const reset = useCallback(() => {
    dispatch({ type: ActionType.RESET });
  }, []);

  const { origin, state, value, error } = reducerState;

  const stateMemo = useMemo(() => {
    return {
      state,
      isInitial: state === StateType.INITIAL,
      isPending: state === StateType.PENDING,
      isResolved: state === StateType.RESOLVED,
      isRejected: state === StateType.REJECTED,
      isFinished: state === StateType.RESOLVED || state === StateType.REJECTED,
    };
  }, [state]);

  const actionsMemo = useMemo(() => {
    return {
      start,
      resolve,
      reject,
      reset,
    };
  }, [reject, reset, resolve, start]);

  return {
    state: stateMemo,
    actions: actionsMemo,
    origin,
    value,
    error,
  };
}
