import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import EnumerationsList from './EnumerationsList';

class EnumerationsRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route
                    key="list"
                    path={this.props.match.url}
                    exact
                >
                    <EnumerationsList />
                </Route>
            </Switch>
        );
    }
}

export default withRouter(EnumerationsRouter);
