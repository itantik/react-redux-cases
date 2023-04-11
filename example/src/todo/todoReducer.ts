import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Todo } from './Todo';

export interface TodoState {
  list: Todo[];
  filter: string;
  dirty: number; // increment when the todo list needs to be reloaded
}

const initialState: TodoState = {
  list: [],
  filter: '',
  dirty: 0,
};

export const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    updateList: (state, action: PayloadAction<Todo[]>) => {
      state.list = action.payload;
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(({ id }) => id !== action.payload);
    },

    updateFilter: (state, action: PayloadAction<string>) => {
      const filterChanged = state.filter !== action.payload;
      if (filterChanged) {
        state.filter = action.payload;
        state.dirty = state.dirty + 1;
      }
    },

    setDirty: state => {
      state.dirty = state.dirty + 1;
    },
  },
});

export const { updateList, removeItem, updateFilter, setDirty } = todoSlice.actions;

export default todoSlice.reducer;
