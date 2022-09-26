import React from "react";
import DataSourceResult from "./results/DataSourceResult";
import {Pagination} from "antd";

class Results extends React.Component {
    constructor(props) {
        super(props);
    }

    renderPagination = () => (
        <Pagination
            showSizeChanger
            current={this.props.page_data_source}
            pageSize={this.props.count_data_source}
            total={this.props.total_count_data_source}
            onChange={this.props.onChangePageDataSource}
        />
    )

    render() {
        if (!this.props.dataSources.length) {
            return (
                <p className="left-col">
                    Aucun résultat trouvé, essayez d'être moins spécifique.
                </p>
            );
        }
        else {
            return (<>
                {this.renderPagination()}
                <br/>
                <div className="results">
                    {this.props.dataSources.map((dataSource) => (
                        <DataSourceResult
                            key={dataSource.id}
                            dataSource={dataSource}
                            onFilterSelect={(key, value) => this.props.addFilter(key, value)}
                        />
                    ))}
                </div>
                {this.renderPagination()}
            </>)
        }
    }
}

export default Results;
