import { Alert } from "antd";
import React from "react";
import './Alert.css';
import {Link} from "react-router-dom";

export default function Warning({ description, message, warningType="", inputType="" }) {
    return (
        <div className="Error">
            <Alert
                description={parseWarningDescription(description, warningType, inputType)}
                message={message}
                type="warning"
                showIcon
                closable
            />
        </div>
    );
}

const parseWarningDescription = (description, warningType, inputType) => {
    if (warningType === 'duplicates') {
        // Is duplicates warning
        if (inputType === 'data_source') {
            const warnings_list = description.list;
            return <>
                {description.header}
                <ul>
                    {
                        Object.keys(warnings_list).map((name) => {
                            return <li>"{name}" lignes {warnings_list[name].map((item, i) => (
                                <span key={i}>
                                    {i > 0 && ", "}
                                    <Link to={'/data-source/' + item.id} target="_blank">
                                    {item.line}
                                    </Link>
                                </span>
                            ))}</li>
                        })
                    }
                </ul>
            </>
        }
        else if (inputType === 'application') {
            const warnings_list = description.list;
            return <>
                {description.header}
                <ul>
                    {
                        Object.keys(warnings_list).map((name) => {
                            return <li>"{name}"{warnings_list[name]['long_name'] && ', "'+warnings_list[name]['long_name']+'"'} lignes {warnings_list[name]['items'].map((item, i) => (
                                <span key={i}>
                                    {i > 0 && ", "}
                                    <Link to={'/application/' + item.id} target="_blank">
                                    {item.line}
                                    </Link>
                                </span>
                                ))}
                            </li>
                        })
                    }
                </ul>
            </>
        }
    }
    else {
        return description;
    }
}
