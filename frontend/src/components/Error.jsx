import { Alert } from "antd";
import React from "react";
import './Alert.css';
import {createError} from "../error/ErrorFactory";

export default function Error({ error }) {
    if (error.response) {
        const errorHumanReadable = createError(error)
        // A description was sent in the response body from the backend
        return (
            <div className="Error">
                <Alert
                    message={errorHumanReadable ? errorHumanReadable : error.response.data.description}
                    type="error"
                />
            </div>
        );
    }
    return (
        <div className="Error">
            <Alert
                message="Un problème est survenu"
                description={error.message}
                type="error"
            />
        </div>
    );
}
