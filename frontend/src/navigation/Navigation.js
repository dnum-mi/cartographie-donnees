import React from 'react';
import {Button, Layout} from 'antd';
import logo from '../Logo_du_Ministère_de_l\'Intérieur_(2020).svg';
import './Navigation.css';
import { logout } from "../api";
import { logout as doLogout } from "../auth";

const { Header } = Layout;

const onLogoutClick = () => {
    logout()
        .then(() => {
            doLogout();
            window.location = '/';
        });
};

function Navigation({ user }) {
  const loginButton = user ? (
      <Button type="link" onClick={onLogoutClick}>
        Se déconnecter
      </Button>
  ) : (
      <a href="/login">
        <Button type="link">
          Se connecter
        </Button>
      </a>
  );
  return (
    <Header className="header">
      <div className="container">
        <span>
            <a className="home" href="/">
              <img alt="Ministère de l'intérieur" src={logo} height="90" />
              <span className="home-title">
                Cartographie des données
              </span>
            </a>
        </span>
        <div>
          {user && (user.is_admin || user.applications.length) &&
          <a href="/admin">
            <Button type="primary">
              Administration
            </Button>
          </a>}
          {loginButton}
        </div>
      </div>
    </Header>
  );
}

export default Navigation;
