import React from 'react';
import {Button, Layout, Space} from 'antd';
import logo from '../logo_MIOM.svg';
import './Navigation.css';
import {logout} from "../api";
import {logout as doLogout} from "../auth";
import {Link, withRouter} from "react-router-dom";
import {SearchOutlined} from '@ant-design/icons';
import {parseQuery} from "../search/QueryUtils"
const {Header} = Layout;

const onLogoutClick = () => {
    logout()
        .then(() => {
            doLogout();
            window.location = '/';
        });
};

function Navigation({user, homepageContent, location}) {

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
    const query = parseQuery(location.search);

    const isEmptySearch = (queryValues) => {
        return !(queryValues.query
            || queryValues.selectedOrganization?.length !== 0
            || queryValues.selectedFamily?.length !== 0
            || queryValues.selectedType?.length !== 0
            || queryValues.selectedApplication?.length !== 0
            || queryValues.selectedReferentiel?.length !== 0
            || queryValues.selectedSensibility?.length !== 0
            || queryValues.selectedOpenData?.length !== 0
            || queryValues.selectedExposition?.length !== 0
            || queryValues.selectedOrigin?.length !== 0
            || queryValues.selectedAnalysisAxis?.length !== 0
            || queryValues.selectedTag?.length !== 0);
    }
    const showNewSearchButton = path !== "search" || !isEmptySearch(query);

    return (
        <Header className="header">
            <div className="container navigation-container">
        <span>
            <Link className="home" to="/">
              <img alt="Ministère de l'intérieur" src={logo} height="90"/>
              <span className="home-title">
                {homepageContent ? homepageContent["app_title"] : "Cartographie des données MI"}
              </span>
            </Link>
        </span>
                <div>
                    <Space>
                        {showNewSearchButton &&
                            <Link to="/">
                                <Button icon={<SearchOutlined/>}>
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
