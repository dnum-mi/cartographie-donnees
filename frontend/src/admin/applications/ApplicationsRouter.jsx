import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import ApplicationsList from './ApplicationsList';

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
            </Switch>
        );
    }
}

export default withRouter(ApplicationsRouter);
