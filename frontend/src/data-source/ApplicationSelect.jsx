import React from "react";
import {Select, Spin} from "antd";
import {searchApplications, searchApplicationsLimited} from "../api";
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
        this.props.limited
            ? searchApplicationsLimited("").then((data) => this.setState({
                applications: data.data.results,
                loading: false
            }))
            : searchApplications("").then((data) => this.setState({applications: data.data.results, loading: false}))
    }

    valuesToOptions = (values) => !!values ? (values.map((value) => ({
        key: value.id,
        value: value.id,
        label: value.name
    }))) : [];

    optionsToValues = (options) => !!options ? (options.map((option) => ({id: option.value, name: option.label}))) : [];

    onChange = (newChoice) => {
        if (!!this.props.mode && this.props.mode === "multiple") {
            this.props.onChange(this.optionsToValues(newChoice));
        } else {
            this.props.onChange(this.state.applications.find((app) => app.id === newChoice));
        }
    }

    getInitialValues = () => {
        if (!!this.props.mode && this.props.mode === "multiple") {
            return this.valuesToOptions(this.props.value)
        } else {
            return !!this.props.value
                ? {
                    key: this.props.value.id,
                    value: this.props.value.id,
                    label: this.props.value.name
                }
                : null
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
                    labelInValue={!!this.props.mode && this.props.mode === "multiple"}
                    defaultValue={this.getInitialValues()}
                    placeholder="Sélectionnez une application"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                    filterSort={(optionA, optionB) =>
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onChange={this.onChange}
                    style={{width: '100%'}}
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

ApplicationSelect.defaultProps = {
    onChange: () => {
    }
}