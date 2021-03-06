import React from "react";
import { Select } from 'antd';
import PropTypes from 'prop-types';
import Loading from "./Loading";
import {fetchEnumerations} from "../api";

const { Option } = Select;


class EnumSelect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            enumerations: [],
        };
    }

    componentDidMount() {
        this.fetchEnumerationsFromApi();
    }

    fetchEnumerationsFromApi = () => {
        this.setState({
            loading: true,
        });
        fetchEnumerations(this.props.category)
            .then((response) => {
                this.setState({
                    enumerations: response.data,
                    loading: false,
                });
            })
            .catch(() => {
                this.setState({
                    loading: false,
                });
            });
    };

    filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

    renderContent() {
        if (this.state.loading) {
            return (
                <Loading />
            );
        }
        return (
            <Select
                showSearch
                optionFilterProp="children"
                filterOption={this.filterOption}
                mode={this.props.mode}
                value={this.props.value}
                defaultValue={this.props.defaultValue}
                onChange={this.props.onChange}
            >
                {!this.props.required && !this.props.mode && (
                    <Option
                        key="null"
                        value={null}
                    >
                        -
                    </Option>
                )}
                {this.state.enumerations.map((item) => (
                    <Option
                        key={item.id}
                        value={item.value}
                    >
                        {item.value}
                    </Option>
                ))}
            </Select>
        );
    }

    render() {
        return (
            <div className="EnumSelect">
                {this.renderContent()}
            </div>
        );
    }
}

EnumSelect.defaultProps = {
    onChange: () => {},
}

EnumSelect.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    mode: PropTypes.string,
    category: PropTypes.string.isRequired,
    required: PropTypes.bool,
    onChange: PropTypes.func,
};

export default EnumSelect;
