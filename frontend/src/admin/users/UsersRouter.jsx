import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import UsersList from './UsersList';
import UserPage from "./UserPage";
import UserCreation from "./UserCreation";
import UserUpdate from "./UserUpdate";

class UsersRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route
                    key="list"
                    path={this.props.match.url}
                    exact
                >
                    <UsersList count={this.props.count} />
                </Route>
                <Route
                    key="list"
                    path={this.props.match.url + '/create'}
                    exact
                >
                    <UserCreation count={this.props.count} />
                </Route>
                <Route
                    key="page"
                    path={this.props.match.url + '/:userId'}
                    exact
                >
                    <UserPage />
                </Route>
                <Route
                    key="update"
                    path={this.props.match.url + '/:userId/update'}
                    exact
                >
                    <UserUpdate />
                </Route>
            </Switch>
        );
    }
}

export default withRouter(UsersRouter);
