import { Alert } from "antd";
import React from "react";
import './Alert.css';

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
                            return <li>"{name}" lignes {warnings_list[name].join(', ')}</li>
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
                            return <li>"{name}"{warnings_list[name]['long_name'] && ', "'+warnings_list[name]['long_name']+'"'} lignes {warnings_list[name]['lines'].join(', ')}</li>
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
