import React from 'react';
import {Layout} from 'antd';

import Router from './navigation/Router';
import './App.css';
import {readMe, fetchWildCards} from './api';
import Loading from "./components/Loading";
import Error from "./components/Error";
import {UserProvider} from "./hoc/user/UserProvider"
import {TooltipsProvider} from "./hoc/tooltips/TooltipsProvider"
import Tooltips from './hoc/tooltips/Tooltips';

const {Content, Footer} = Layout;

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
        this.refreshUser(true)
            .then(() => this.refreshWildcards());
    }

    setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve(newState)))

    refreshWildcards = () => {
        return this.setStatePromise({
            loading: true,
            error: null,
        }).then(() => Promise.all([fetchWildCards("tooltips"), fetchWildCards("homepage"), fetchWildCards("synonyme")]))
            .then(([res_tooltips, res_homepage, res_synonyms]) => {
                this.setState({
                    tooltips_object: new Tooltips(res_tooltips.data.tooltips, this.refreshWildcards),
                    homepageContent: res_homepage.data.homepage,
                    synonymsContent: res_synonyms.data.synonyme.synonyme,
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

    refreshUser = (keep_loading = false) => {
        return this.setStatePromise({
            loading: true,
            error: null,
        })
            .then(() => readMe())
            .then((r) => this.setStatePromise({
                loading: keep_loading,
                error: null,
                user: r.data,
            }))
            .catch((error) => this.setStatePromise({
                loading: keep_loading,
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
            return <Error error={this.state.error}/>
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
                                    synonymsContent={this.state.synonymsContent}
                                    updateHomepage={this.updateHomepage}
                                    loading={this.state.loading}
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
