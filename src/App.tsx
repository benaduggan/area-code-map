import * as React from 'react';
import styled from 'styled-components';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { Dashboard } from 'src/pages/Dashboard';

export const BaseApp = styled.div`
  min-height: 100%;
`;

export const App = (): JSX.Element => (
  <React.StrictMode>
    <BrowserRouter>
      <BaseApp>
        <Switch>
          <Route path="/" exact>
            <Dashboard />
          </Route>
          <Route>
            <div>Hello world!</div>
          </Route>
        </Switch>
      </BaseApp>
    </BrowserRouter>
  </React.StrictMode>
);
