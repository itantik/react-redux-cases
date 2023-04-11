import { useReduxCaseState } from 'react-redux-cases';
import AddItemCase from './AddItemCase';

export default function useAddItem() {
  return useReduxCaseState(AddItemCase.create);
}
