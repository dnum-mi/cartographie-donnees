import React from 'react';
import {Button, Layout} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import logo from '../logo.png';
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
              <HomeOutlined/>
            </a>
            <a href="/">
              <img alt="Cartographie" src={logo} height="30" />
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
