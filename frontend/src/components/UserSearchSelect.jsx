import React from 'react';
import { searchUsers } from '../api';
import PropTypes from "prop-types";
import SearchSelect from "./SearchSelect";

class UserSearchSelect extends React.Component {

    userToOption = (value) => value ? ({ key: value.id, value: value.id, label: value.first_name + " " + value.last_name }) : ({ key: null, value: null, label: null });

    optionToUser = (option) => option && option.value ? ({ id: option.value, first_name: option.label.split(' ')[0], last_name: option.label.split(' ')[1] }) : null;

    render() {
        return (
            <SearchSelect
                search={searchUsers}
                itemToOption={this.userToOption}
                optionToItem={this.optionToUser}
                placeholder="Recherchez un utilisateur"
                value={this.props.value}
                defaultValue={this.props.defaultValue}
                mode={this.props.mode}
                onChange={this.props.onChange}
            />
        );
    }
}

UserSearchSelect.defaultProps = {
    mode: 'multiple',
}

UserSearchSelect.propTypes = {
    value: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
    defaultValue: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
    mode: PropTypes.string,
    onChange: PropTypes.func,
};

export default UserSearchSelect;
