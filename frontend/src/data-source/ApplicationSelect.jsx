import React from "react";
import {Divider, Select, Spin} from "antd";
import {fetchApplications, searchApplicationsLimited} from "../api";
import Loading from "../components/Loading";
import {QuestionCircleOutlined} from "@ant-design/icons";

export default class ApplicationSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applications: [],
            loading: true
        }
    }

    componentDidMount() {
        searchApplicationsLimited("").then((data)=> this.setState({applications: data.data.results, loading: false}))
    }

    onChange = (newChoice) => {
        this.props.onChange(this.state.applications.find((app) => app.id === newChoice));
    }

    render() {
        if (this.state.loading) {
            return <Loading />;
        }
        return (
            <div className="attribute">
                <label className="attribute-label">
                    Choix d'Application
                    <QuestionCircleOutlined
                        className="attribute-tooltip"
                        title="xxxx"
                    />
                </label>
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
                <Divider/>
            </div>
        );
    }
}
