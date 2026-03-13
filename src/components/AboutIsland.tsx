import { Provider } from 'react-redux';
import { store } from '../store';
import About from '../views/About';

export default function AboutIsland() {
  return (
    <Provider store={store}>
      <About />
    </Provider>
  );
}
