import React from 'react';
import { Layout } from 'antd';

import Router from './navigation/Router';
import './App.css';
import { } from './auth/index';
import { readMe, fetchWildCards } from './api';
import Loading from "./components/Loading";
import Error from "./components/Error";
import { UserProvider } from "./hoc/user/UserProvider"
import { TooltipsProvider } from "./hoc/tooltips/TooltipsProvider"
import Tooltips from './hoc/tooltips/Tooltips';

const { Content, Footer } = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      homepageContent: {},
      tooltips_object: new Tooltips({}, () => Promise.resolve()),
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.refreshWildcards();
    this.refreshUser();
  }

  setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve(newState)))

  refreshWildcards = () => {
    return this.setStatePromise({
      loading: true,
      error: null,
    }).then(() => Promise.all([fetchWildCards("tooltips"), fetchWildCards("homepage")]))
      .then(([res_tooltips, res_homepage]) => {
        this.setState({
          tooltips_object: new Tooltips(res_tooltips.data.tooltips, this.refreshWildcards),
          homepageContent: res_homepage.data.homepage,
          loading: false,
          error: null
        })
      })
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

  updateHomepage = (value, key = null) => {
    if (key === null) {
      this.setState({
        homepageContent: value
      })
    } else {
      this.setState({
        homepageContent: {
          ...this.state.homepageContent,
          [key]: value
        }
      })
    }
  }

  render() {
    if (this.state.error) {
      return <Error error={this.state.error} />
    }
    return (
      <div className="App">
        <UserProvider user={this.state.user}>
          <TooltipsProvider tooltips={this.state.tooltips_object}>
            <Layout className="layout">
              <Content className="page-content">
                <Router
                  user={this.state.user}
                  onLogin={this.refreshUser}
                  homepageContent={this.state.homepageContent}
                  updateHomepage={this.updateHomepage}
                />
              </Content>
              <Footer className="footer">
                Designed by Artelys ©2021
              </Footer>
            </Layout>
          </TooltipsProvider>
        </UserProvider>
      </div>
    );
  }
}

export default App;
