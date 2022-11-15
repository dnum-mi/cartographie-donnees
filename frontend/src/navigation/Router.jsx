import React from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import emptyDataSourceForApplication from '../application/emptyDataSourceForApplication.json'

import NotFound from '../components/NotFound';
import ApplicationPage from '../application/ApplicationPage';
import AdminPage from '../admin/AdminPage';
import SearchPage from '../search/SearchPage';
import LoginPage from '../auth/LoginPage';
import ResetPasswordPage from "../auth/ResetPasswordPage";
import ForgotPasswordPage from "../auth/ForgotPasswordPage";
import DataSourceFetcher from "../data-source/DataSourceFetcher";
import DataSourceCreation from "../admin/data-sources/DataSourceCreation";
import Navigation from "./Navigation";
import RoutingCount from "./RoutingCount";

function Router({ user, onLogin, homepageContent, updateHomepage, loading }) {
  return (
    <BrowserRouter>
      <RoutingCount loading={loading}></RoutingCount>
      <Navigation user={user} homepageContent={homepageContent}/>
      <Switch>
        <Route path="/" exact>
          <Redirect to="/search" />
        </Route>
        <Route path="/search" exact>
          <SearchPage homepageContent={homepageContent}/>
        </Route>
        <Route path="/login" exact>
          <LoginPage user={user} onLogin={onLogin} />
        </Route>
        <Route path="/forgot-password" exact>
          <ForgotPasswordPage />
        </Route>
        <Route path="/reset-password/:token" exact>
          <ResetPasswordPage />
        </Route>
        {user && user.is_admin && (
            <Route path="/application/create" exact>
              <DataSourceCreation fromAppCreation initialDataSource={emptyDataSourceForApplication}/>
            </Route>
        )}
        <Route path="/application/:applicationId">
          <ApplicationPage user={user} />
        </Route>
        <Route path="/data-source/create" exact>
          <DataSourceCreation fromDataSourceCreation/>
        </Route>
        <Route path="/data-source/:dataSourceId">
          <DataSourceFetcher/>
        </Route>
        {user && (
          <Route path="/admin">
            <AdminPage user={user} updateHomepage = {updateHomepage} homepageContent= {homepageContent}/>
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
