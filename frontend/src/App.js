import React from 'react';
import {Layout} from 'antd';

import Router from './navigation/Router';
import Navigation from "./navigation/Navigation";
import './App.css';
import { } from './auth/index';
import { readMe } from './api';
import Loading from "./components/Loading";
import Error from "./components/Error";
import { UserProvider } from "./hoc/user/UserProvider"

const { Content, Footer } = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.refreshUser();
     document.title = "Cartographie Données MI"
  }

  setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve(newState)))

  refreshUser = () => {
    readMe()
        .then((r) => this.setStatePromise({
          loading: false,
          error: null,
          user: r.data,
        }))
        .catch((error) => this.setStatePromise({
          loading: false,
          // If the user is not authenticated, we receive a 404
          error: error.response && error.response.status === 404 ? null : error,
          user: null,
        }));
  };

  render() {
    if (this.state.loading) {
      return <Loading />
    }
    if (this.state.error) {
      return <Error error={this.state.error} />
    }
    return (
      <div className="App">
        <UserProvider user={this.state.user}>
          <Layout className="layout">
            <Navigation user={this.state.user}/>
            <Content className="page-content">
              <Router
                  user={this.state.user}
                  onLogin={this.refreshUser}
              />
            </Content>
            <Footer className="footer">
              Designed by Artelys ©2021
            </Footer>
          </Layout>
        </UserProvider>
      </div>
    );
  }
}

export default App;
