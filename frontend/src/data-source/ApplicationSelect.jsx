import React from "react";
import {Select, Spin} from "antd";
import {fetchApplications} from "../api";
import Loading from "../components/Loading";

export default class ApplicationSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applications: [],
            loading: true
        }
    }

    componentDidMount() {
        fetchApplications(1,1000).then((data)=> this.setState({applications: data.data.results, loading: false}))
    }

    onChange = (newChoice) => {
        this.props.onChange(this.state.applications.find((app) => app.id === newChoice));
    }

    render() {
        if (this.state.loading) {
            return <Loading />;
        }
        return (
            <Select
                value={this.props.value.id}
                placeholder="Sélectionnez une application"
                showSearch
                onChange={this.onChange}
                style={{ width: '100%' }}
            >
                {this.state.applications.map((application) =>
                    <Select.Option key={application.id} value={application.id}>
                        {application.name}
                    </Select.Option>
                )}
            </Select>
        );
    }
}
