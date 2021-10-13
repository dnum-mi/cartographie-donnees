import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import DataSourcesList from './DataSourcesList';
import DataSourceCreation from "./DataSourceCreation";
import DataSourceUpdate from "./DataSourceUpdate";

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
                <Route
                    key="create"
                    path={this.props.match.url + '/create'}
                    exact
                >
                    <DataSourceCreation count={this.props.count} />
                </Route>
                <Route
                    key="update"
                    path={this.props.match.url + '/:dataSourceId/update'}
                    exact
                >
                    <DataSourceUpdate />
                </Route>
            </Switch>
        );
    }
}

export default withRouter(DataSourcesRouter);
