import { Provider } from 'react-redux';
import { store } from '../store';
import Merch from '../views/Merch';

export default function MerchIsland() {
  return (
    <Provider store={store}>
      <Merch />
    </Provider>
  );
}
