import { useReduxCase } from 'react-redux-cases';
import RemoveItemCase from './RemoveItemCase';

export default function useRemoveItem() {
  return useReduxCase(RemoveItemCase.create);
}
