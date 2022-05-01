import { useReducer, useCallback, useMemo, Reducer } from 'react';

export enum Status {
  INITIAL = 'INITIAL',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

type State<R, E> = {
  origin?: string; // identification of the value/error source
  status: Status;
  value?: R;
  error?: E;
};

const initialState = {
  origin: undefined,
  status: Status.INITIAL,
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

const reducer = <R, E>(state: State<R, E>, action: Action<R, E>) => {
  const { type } = action;

  switch (type) {
    case ActionType.START:
      return {
        ...state,
        status: Status.PENDING,
        origin: action.origin,
        // the value and error remain unchanged
      };

    case ActionType.RESOLVE:
      return {
        ...state,
        status: Status.RESOLVED,
        value: action.payload,
        error: undefined,
        origin: action.origin,
      };

    case ActionType.REJECT:
      return {
        ...state,
        status: Status.REJECTED,
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

export function useStatus<R, E>() {
  const [reducerState, dispatch] = useReducer<Reducer<State<R, E>, Action<R, E>>>(
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

  const { origin, status, value, error } = reducerState;

  const statusPack = useMemo(() => {
    return {
      status,
      isInitial: status === Status.INITIAL,
      isPending: status === Status.PENDING,
      isResolved: status === Status.RESOLVED,
      isRejected: status === Status.REJECTED,
      isFinished: status === Status.RESOLVED || status === Status.REJECTED,
    };
  }, [status]);

  return {
    status: statusPack,
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
