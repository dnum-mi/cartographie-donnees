import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import ApplicationsList from './ApplicationsList';
import ApplicationCreation from "./ApplicationCreation";
import ApplicationUpdate from "./ApplicationUpdate";

class ApplicationsRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route
                    key="list"
                    path={this.props.match.url}
                    exact
                >
                    <ApplicationsList user={this.props.user} count={this.props.count} />
                </Route>
                {this.props.user.is_admin && (
                <Route
                    key="create"
                    path={this.props.match.url + '/create'}
                    exact
                >
                    <ApplicationCreation user={this.props.user} count={this.props.count} />
                </Route>
                )}
                <Route
                    key="update"
                    path={this.props.match.url + '/:applicationId/update'}
                    exact
                >
                    <ApplicationUpdate user={this.props.user} />
                </Route>
            </Switch>
        );
    }
}

export default withRouter(ApplicationsRouter);
