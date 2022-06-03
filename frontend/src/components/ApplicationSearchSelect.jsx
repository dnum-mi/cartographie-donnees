import React from 'react';
import { searchApplications, searchApplicationsLimited } from '../api';
import PropTypes from "prop-types";
import SearchSelect from "./SearchSelect";

class ApplicationSearchSelect extends React.Component {
    applicationToOption = (application) => application ? ({
        key: application.id,
        value: application.id,
        label: application.name,
    }) : ({
        key: null,
        value: null,
        label: null,
    });

    optionToApplication = (option) => option && option.value ? ({
        id: option.value,
        name: option.label,
    }) : null;

    render() {
        return (
            <SearchSelect
                search={this.props.limited ? searchApplicationsLimited : searchApplications}
                itemToOption={this.applicationToOption}
                optionToItem={this.optionToApplication}
                placeholder="Recherchez une application"
                value={this.props.value}
                defaultValue={this.props.defaultValue}
                mode={this.props.mode}
                onChange={this.props.onChange}
                allowClear={this.props.allowClear}
            />
        );
    }
}

ApplicationSearchSelect.defaultProps = {
    allowClear : false
}

ApplicationSearchSelect.propTypes = {
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    mode: PropTypes.string,
    onChange: PropTypes.func,
    allowClear: PropTypes.bool
};

export default ApplicationSearchSelect;
