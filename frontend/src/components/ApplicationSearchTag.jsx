import React from "react";
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { searchApplications, searchApplicationsLimited } from '../api';
import PropTypes from 'prop-types';
import Loading from "./Loading";
import {fetchEnumerations} from "../api";

const { Option } = Select;


class ApplicationSearchTag extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], // Choices
            loading: false,
            search: props.limited ? searchApplicationsLimited : searchApplications
        };
        this.lastFetchId = 0;
        this.fetch = debounce(this.fetch, 400);
    }

    fetch = (value) => {
        this.lastFetchId += 1;
        const fetchId = this.lastFetchId;
        this.setState({
            data: [],
            loading: true,
        });
        this.state.search(value)
            .then((response) => {
                if (fetchId !== this.lastFetchId) {
                    // for fetch callback order
                    return;
                }
                this.setState({
                    data: response.data.results,
                    loading: false,
                });
            })
            .catch(() => {
                this.setState({
                    loading: false,
                });
            });
    };

    valueToOption = (values) => values ? (values.map((value) => ( {key: value.id, value: value.id, label: value.name} ))) : [];

    optionToValue = (options) => options ? (options.map((option) => ( { id: option.value, name: option.label }))) : [];

    onChange = (selectedOption) => {
        const newValue = this.optionToValue(selectedOption);
        this.props.onChange(newValue);
    };

    render() {
        const { loading, data } = this.state;
        return (
            <Select
                labelInValue
                value={this.valueToOption(this.props.value)}
                defaultValue={this.valueToOption(this.props.value)}
                placeholder="Sélectionnez une application"
                notFoundContent={loading ? <Spin size="small" /> : null}
                filterOption={false}
                mode="multiple"
                showSearch
                onSearch={this.fetch}
                onChange={this.onChange}
                style={{ width: '100%' }}
            >
                {data.map((choice) => (
                    <Option key={choice.id} value={choice.id}>
                        {choice.name}
                    </Option>
                ))}
            </Select>
        );
    }
}

ApplicationSearchTag.defaultProps = {
    onChange: () => {},
}

ApplicationSearchTag.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.object),
    ]),
    mode: PropTypes.string,
    required: PropTypes.bool,
    onChange: PropTypes.func,
};

export default ApplicationSearchTag;
