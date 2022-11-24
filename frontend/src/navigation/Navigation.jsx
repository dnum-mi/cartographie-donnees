import React from 'react';
import {Button, Layout, Space} from 'antd';
import logo from '../Logo_du_Ministère_de_l\'Intérieur_(2020).svg';
import './Navigation.css';
import { logout } from "../api";
import { logout as doLogout } from "../auth";
import {Link, withRouter} from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import {useEffect, useState} from 'react';


const { Header } = Layout;

const onLogoutClick = () => {
    logout()
        .then(() => {
            doLogout();
            window.location = '/';
        });
};

function Navigation({ user, homepageContent, location }) {

  const loginButton = user ? (
      <Button type="link" onClick={onLogoutClick}>
        Se déconnecter
      </Button>
  ) : (
      <Link to="/login">
        <Button type="link">
          Se connecter
        </Button>
      </Link>
  );
  const path = location.pathname.split('/')[1];
  const query = window.location.search;
  const showNewSearchButton = path !== "search" || query !== '';

  return (
    <Header className="header">
      <div className="container navigation-container">
        <span>
            <Link className="home" to="/">
              <img alt="Ministère de l'intérieur" src={logo} height="90" />
              <span className="home-title">
                {homepageContent ? homepageContent["app_title"] : "Cartographie des données MI"}
              </span>
            </Link>
        </span>
        <div>
            <Space>
                {showNewSearchButton &&
                    <Link to="/">
                        <Button icon={<SearchOutlined />}>
                            Nouvelle recherche
                        </Button>
                    </Link>}
                {user &&
                    <Link to="/admin">
                        <Button type="primary" data-test="nav-admin-btn">
                            Administration
                        </Button>
                    </Link>}
                {loginButton}
            </Space>
        </div>
      </div>
    </Header>
  );
}

export default withRouter(Navigation);
