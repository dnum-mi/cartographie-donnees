import React from "react";
import { Tag } from 'antd';
import PropTypes from 'prop-types';


class EnumTags extends React.Component {
    render() {
        return (
            <>
                {this.props.enum.map((item) => (
                    <Tag color={this.props.color}>{item}</Tag>
                ))}
            </>
        );
    }
}

EnumTags.propTypes = {
    enum: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default EnumTags;
