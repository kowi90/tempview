import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Reports from './Reports';
import Router from './Router';
import * as serviceWorker from './serviceWorker';

export const ROUTE_APP = 'ROUTE_APP';
export const ROUTE_REPORTS = 'ROUTE_REPORTS';

const routes = {
  ROUTE_APP: App,
  ROUTE_REPORTS: Reports
};

ReactDOM.render(
  <React.StrictMode>
    <Router
      routes={routes}
      defaultRoute={ROUTE_APP}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
