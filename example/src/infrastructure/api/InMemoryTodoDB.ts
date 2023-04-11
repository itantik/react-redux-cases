import { Todo } from '../../todo/Todo';

type InMemoryTodoDBType = {
  list: Todo[];
};

const todoDB: InMemoryTodoDBType = { list: [] };

export const InMemoryTodoDB = {
  list(filter: string) {
    return filter
      ? todoDB.list.filter(({ title }) => title.toLowerCase().includes(filter.toLowerCase()))
      : todoDB.list;
  },

  add(item: Todo) {
    if (!item.id) {
      throw new Error('ID is required');
    }
    if (!item.title) {
      throw new Error('Title is required');
    }
    todoDB.list = [...todoDB.list, { ...item }];
  },

  remove(itemId: string) {
    if (!itemId) {
      throw new Error('ID is required');
    }
    if (!todoDB.list.some(({ id }) => id === itemId)) {
      throw new Error('Item not found');
    }
    todoDB.list = todoDB.list.filter(({ id }) => id !== itemId);
  },
};
