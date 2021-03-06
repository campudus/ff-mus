import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import promiseMiddleware from './promiseMiddleware';
import createLogger from 'redux-logger';
import rootReducer from '../reducer';
import DevTools from '../components/devtools';
import {Iterable} from 'immutable';
import _ from 'lodash';

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(thunk, promiseMiddleware, createLogger({
    stateTransformer : (state) => {
      if ("app" in state && Iterable.isIterable(state.app)) {
        return _.assign({}, state, {
          app : state.app.toJS()
        });
      } else if (Iterable.isIterable(state)) {
        return state.toJS();
      } else return state;
    }
  })),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument(),
  // Optional. Lets you write ?debug_session=<key> in address bar to persist debug sessions
  persistState(getDebugSessionKey())
);

function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return (matches && matches.length > 0) ? matches[1] : null;
}

export default function configureStore(initialState) {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducer', () =>
      store.replaceReducer(require('../reducer/index')/*.default if you use Babel 6+ */)
    );
  }

  return store;
}
