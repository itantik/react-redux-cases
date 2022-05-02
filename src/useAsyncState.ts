import { useReducer, useCallback, useMemo, Reducer } from 'react';

export enum State {
  INITIAL = 'INITIAL',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

type ReducerState<R, E> = {
  origin?: string; // identification of the value/error source
  state: State;
  value?: R;
  error?: E;
};

const initialState = {
  origin: undefined,
  state: State.INITIAL,
  value: undefined,
  error: undefined,
};

enum ActionType {
  START = 'START',
  RESOLVE = 'RESOLVE',
  REJECT = 'REJECT',
  RESET = 'RESET',
}

type Action<R, E> =
  | {
      type: ActionType.START;
      origin?: string;
    }
  | {
      origin?: string;
      type: ActionType.RESOLVE;
      payload?: R;
    }
  | {
      origin?: string;
      type: ActionType.REJECT;
      payload?: E;
    }
  | {
      type: ActionType.RESET;
    };

const reducer = <R, E>(state: ReducerState<R, E>, action: Action<R, E>) => {
  const { type } = action;

  switch (type) {
    case ActionType.START:
      return {
        ...state,
        state: State.PENDING,
        origin: action.origin,
        // the value and error remain unchanged
      };

    case ActionType.RESOLVE:
      return {
        ...state,
        state: State.RESOLVED,
        value: action.payload,
        error: undefined,
        origin: action.origin,
      };

    case ActionType.REJECT:
      return {
        ...state,
        state: State.REJECTED,
        value: undefined,
        error: action.payload,
        origin: action.origin,
      };

    case ActionType.RESET:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export function useAsyncState<R, E>() {
  const [reducerState, dispatch] = useReducer<Reducer<ReducerState<R, E>, Action<R, E>>>(
    reducer,
    initialState,
  );

  const start = useCallback((origin?: string) => {
    dispatch({ type: ActionType.START, origin });
  }, []);

  const resolve = useCallback((value: R, origin?: string) => {
    dispatch({ type: ActionType.RESOLVE, payload: value, origin });
  }, []);

  const reject = useCallback((error: E, origin?: string) => {
    dispatch({ type: ActionType.REJECT, payload: error, origin });
  }, []);

  /**
   * Resets to initial state, clears value and error.
   */
  const reset = useCallback(() => {
    dispatch({ type: ActionType.RESET });
  }, []);

  const { origin, state, value, error } = reducerState;

  const statePack = useMemo(() => {
    return {
      state,
      isInitial: state === State.INITIAL,
      isPending: state === State.PENDING,
      isResolved: state === State.RESOLVED,
      isRejected: state === State.REJECTED,
      isFinished: state === State.RESOLVED || state === State.REJECTED,
    };
  }, [state]);

  return {
    state: statePack,
    origin,
    value,
    error,
    // actions
    start,
    resolve,
    reject,
    reset,
  };
}
