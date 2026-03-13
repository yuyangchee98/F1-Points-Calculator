import { Provider } from 'react-redux';
import { store } from '../store';
import Compete from '../views/Compete';

export default function CompeteIsland() {
  return (
    <Provider store={store}>
      <Compete />
    </Provider>
  );
}
