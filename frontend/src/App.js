import React from 'react';
import {Layout} from 'antd';

import Router from './navigation/Router';
import './App.css';
import { } from './auth/index';
import { readMe, fetchWildCards } from './api';
import Loading from "./components/Loading";
import Error from "./components/Error";
import { UserProvider } from "./hoc/user/UserProvider"

const { Content, Footer } = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      homepageContent: {},
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchHomepageContent()
    this.refreshUser();
  }

  setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve(newState)))

  fetchHomepageContent = () => {

    this.setState({
        loading: true,
        error: null,
    });

    fetchWildCards("homepage")
        .then((response) => {
            return this.setStatePromise({homepageContent: response.data.homepage})
        })
        // .then(() => this.setStatePromise({ loading: false, error: null })) TODO Why does it make it bug
        .catch((error) => {
            this.setState({
                loading: false,
                error,
            });
        });
    };


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

  refreshHomepage = (key,value) => {
    this.setState({
      homepageContent: {
        ...this.state.homepageContent,
        [key]:value
      }
    })
  }

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
            <Content className="page-content">
              <Router
                  user={this.state.user}
                  onLogin={this.refreshUser}
                  homepageContent={this.state.homepageContent}
                  refreshHomepage = {this.refreshHomepage}
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
