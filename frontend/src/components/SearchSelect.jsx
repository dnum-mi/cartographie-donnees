import { Select, Spin } from 'antd';
import React from 'react';
import debounce from 'lodash/debounce';
import PropTypes from "prop-types";

const { Option } = Select;

class SearchSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], // Choices
            loading: false,
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
        this.props.search(value)
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

    onChange = (selectedOption) => {
        if (this.props.mode === "multiple" || this.props.mode === "tags") {
            // selectedOption is an array
            const newValue = selectedOption ? selectedOption.map(this.props.optionToItem) : [];
            this.props.onChange(newValue);
        } else {
            const newValue = this.props.optionToItem(selectedOption);
            this.props.onChange(newValue);
        }
    };

    valueToOption = (value) => {
        if (this.props.mode === "multiple" || this.props.mode === "tags") {
            // The value is an array
            return value ? value.map(this.props.itemToOption) : [];
        }
        return this.props.itemToOption(value);
    }

    render() {
        const { loading, data } = this.state;
        return (
            <Select
                mode={this.props.mode}
                labelInValue
                value={this.valueToOption(this.props.value)}
                defaultValue={this.props.itemToOption(this.props.value)}
                placeholder={this.props.placeholder}
                notFoundContent={loading ? <Spin size="small" /> : null}
                filterOption={false}
                showSearch
                onSearch={this.fetch}
                onChange={this.onChange}
                style={{ width: '100%' }}
                allowClear={this.props.allowClear}
            >
                {data.map(this.props.itemToOption)
                    .map((choice) => (
                    <Option key={choice.key} value={choice.value}>
                        {choice.label}
                    </Option>
                ))}
            </Select>
        );
    }
}

SearchSelect.defaultProps = {
    onChange: () => {},
    allowClear : false
}

SearchSelect.propTypes = {
    allowClear: PropTypes.bool,
    search: PropTypes.func.isRequired,
    itemToOption: PropTypes.func.isRequired,
    optionToItem: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
    defaultValue: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
    mode: PropTypes.string,
    onChange: PropTypes.func,
};

export default SearchSelect;
