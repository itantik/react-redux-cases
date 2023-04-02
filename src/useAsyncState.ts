import { useReducer, useCallback, useMemo, Reducer } from 'react';

export const AsyncState = {
  initial: 'initial',
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected',
} as const;
export type AsyncStateType = (typeof AsyncState)[keyof typeof AsyncState];

type ReducerState<V, E> = {
  state: AsyncStateType;
  value?: V;
  error?: E;
};

const initialState = {
  state: AsyncState.initial,
  value: undefined,
  error: undefined,
};

const ActionType = {
  start: 'start',
  resolve: 'resolve',
  reject: 'reject',
  reset: 'reset',
} as const;

type Action<V, E> =
  | {
      type: typeof ActionType.start;
    }
  | {
      type: typeof ActionType.resolve;
      value?: V;
    }
  | {
      type: typeof ActionType.reject;
      error?: E;
    }
  | {
      type: typeof ActionType.reset;
    };

const reducer = <V, E>(state: ReducerState<V, E>, action: Action<V, E>) => {
  const { type } = action;

  switch (type) {
    case ActionType.start:
      return {
        ...state,
        state: AsyncState.pending,
        // the value and error remain unchanged
      };

    case ActionType.resolve:
      return {
        ...state,
        state: AsyncState.resolved,
        value: action.value,
        error: undefined,
      };

    case ActionType.reject:
      return {
        ...state,
        state: AsyncState.rejected,
        value: undefined,
        error: action.error,
      };

    case ActionType.reset:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export function useAsyncState<V, E>() {
  const [reducerState, dispatch] = useReducer<Reducer<ReducerState<V, E>, Action<V, E>>>(reducer, {
    ...initialState,
  });

  const start = useCallback(() => {
    dispatch({ type: ActionType.start });
  }, []);

  /**
   * Sets new state value.
   */
  const resolve = useCallback((value: V) => {
    dispatch({ type: ActionType.resolve, value });
  }, []);

  /**
   * Sets new state error.
   */
  const reject = useCallback((error: E) => {
    dispatch({ type: ActionType.reject, error });
  }, []);

  /**
   * Resets to initial state, clears value and error.
   */
  const reset = useCallback(() => {
    dispatch({ type: ActionType.reset });
  }, []);

  const { state, value, error } = reducerState;

  const stateMemo = useMemo(() => {
    return {
      state,
      isInitial: state === AsyncState.initial,
      isPending: state === AsyncState.pending,
      isResolved: state === AsyncState.resolved,
      isRejected: state === AsyncState.rejected,
      isFinished: state === AsyncState.resolved || state === AsyncState.rejected,
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
    value,
    error,
  };
}
