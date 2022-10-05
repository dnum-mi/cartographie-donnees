import React from "react";
import { Divider, Select, Spin } from "antd";
import { fetchApplications, searchApplicationsLimited } from "../api";
import Loading from "../components/Loading";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./ApplicationSelect.css"

export default class ApplicationSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applications: [],
            loading: true
        }
    }

    componentDidMount() {
        searchApplicationsLimited("").then((data) => this.setState({ applications: data.data.results, loading: false }))
    }

    valuesToOptions = (values) => !!values ? (values.map((value) => ({ key: value.id, value: value.id, label: value.name }))) : [];

    optionsToValues = (options) => !!options ? (options.map((option) => ({ id: option.value, name: option.label }))) : [];

    onChange = (newChoice) => {
        if (!!this.props.mode && this.props.mode == "multiple") {
            this.props.onChange(this.optionsToValues(newChoice));
        } else {
            this.props.onChange(this.state.applications.find((app) => app.id === newChoice));
        }
    }

    render() {
        return (
            <Spin
                spinning={this.state.loading}
                wrapperClassName="width-100"
                className="width-100"
            >
                <Select
                    mode={this.props.mode}
                    labelInValue={!!this.props.mode && this.props.mode == "multiple"}
                    value={
                        this.state.loading
                            ? null
                            : (!!this.props.mode && this.props.mode == "multiple") ?
                                this.valuesToOptions(this.props.value) :
                                this.props.value.id
                    }
                    placeholder="Sélectionnez une application"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    filterSort={(optionA, optionB) =>
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onChange={this.onChange}
                    style={{ width: '100%' }}
                >
                    {this.state.applications.map((application) =>
                        <Select.Option key={application.id} value={application.id}>
                            {application.name}
                        </Select.Option>
                    )}
                </Select>
            </Spin>
        );
    }
}
