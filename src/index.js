import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import reducers from './reducers';
import './assests/scss/main.scss';
import 'react-toastify/dist/ReactToastify.css';
import { msalConfig } from "./authConfig";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import Toaster from './components/common/Toaster';
import { clientName } from './config/constants';
const msalInstance = new PublicClientApplication(msalConfig);

const createStoreWithMiddleware = applyMiddleware(ReduxThunk)(createStore);

// Set initial active account if there are already accounts in the cache
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

msalInstance.addEventCallback((event) => {

  switch (event.eventType) {
    case EventType.LOGIN_SUCCESS:
      if (event.payload && event.payload.account) {
        msalInstance.setActiveAccount(event.payload.account);

      } else {
      }
      break;

    case EventType.LOGIN_FAILURE:
      Toaster.error(event.error)
      break;

    case EventType.ACQUIRE_TOKEN_SUCCESS:
      if (event.payload) {
      } else {
      }
      break;

    case EventType.ACQUIRE_TOKEN_FAILURE:
      Toaster.error(event.error)
      break;

    default:
  }
});


msalInstance.handleRedirectPromise().then(authResult => {
  if (authResult !== null) {
    const account = msalInstance.getActiveAccount();
    if (!account) {

    }

  } else {
  }
}).catch(err => {
  Toaster.error(err)
});

// Store initialization with support for Redux DevTools
const store = createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App instance={msalInstance}
        client={clientName} />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
