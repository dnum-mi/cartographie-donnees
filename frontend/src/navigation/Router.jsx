import React from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import NotFound from '../components/NotFound';
import ApplicationPage from '../application/ApplicationPage';
import AdminPage from '../admin/AdminPage';
import SearchPage from '../search/SearchPage';
import LoginPage from '../auth/LoginPage';
import ResetPasswordPage from "../auth/ResetPasswordPage";
import ForgotPasswordPage from "../auth/ForgotPasswordPage";
import DataSourceFetcher from "../data-source/DataSourceFetcher";
import DataSourceCreation from "../admin/data-sources/DataSourceCreation";

function Router({ user, onLogin }) {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <Redirect to="/search" />
        </Route>
        <Route path="/search" exact>
          <SearchPage />
        </Route>
        <Route path="/login" exact>
          <LoginPage onLogin={onLogin} />
        </Route>
        <Route path="/forgot-password" exact>
          <ForgotPasswordPage />
        </Route>
        <Route path="/reset-password/:token" exact>
          <ResetPasswordPage />
        </Route>
        <Route path="/application/:applicationId">
          <ApplicationPage user={user} />
        </Route>
        <Route path="/data-source/create" exact>
          <DataSourceCreation/>
        </Route>
        <Route path="/data-source/:dataSourceId">
          <DataSourceFetcher/>
        </Route>
        {user && (
          <Route path="/admin">
            <AdminPage user={user} />
          </Route>
        )}
        <Route key="404">
          <NotFound />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
