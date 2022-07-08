import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import DataSourcesList from './DataSourcesList';

class DataSourcesRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route
                    key="list"
                    path={this.props.match.url}
                    exact
                >
                    <DataSourcesList user={this.props.user} count={this.props.count}/>
                </Route>
            </Switch>
        );
    }
}

export default withRouter(DataSourcesRouter);
