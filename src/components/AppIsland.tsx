import { Provider } from 'react-redux';
import { store } from '../store';
import App from '../App';

export default function AppIsland({ year }: { year?: string }) {
  return (
    <Provider store={store}>
      <App year={year} />
    </Provider>
  );
}
