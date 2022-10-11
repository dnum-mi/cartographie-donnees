import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import SettingsPage from "./SettingsPage";

class SettingsRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route
                    key="list"
                    path={this.props.match.url}
                    exact
                >
                    <SettingsPage updateHomepage = {this.props.updateHomepage} homepageContent= {this.props.homepageContent}/>
                </Route>
            </Switch>
        );
    }
}

export default withRouter(SettingsRouter);
