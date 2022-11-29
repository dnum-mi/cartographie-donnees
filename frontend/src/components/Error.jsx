import React from 'react';
import {Alert, Button, Col, Row} from "antd";
import './Alert.css';
import {createError} from "../error/ErrorFactory";

export default class Error extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: true
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if ( this.props.error?.response?.data?.description !==  prevProps.error?.response?.data?.description || prevState.visible === false) {
            this.setState({visible: true})
        }
    }

    hideError = () => {
        this.setState({visible: false})
    }

    render() {
        const { error } = this.props;
        if ( this.state.visible && this.props.error !== null ) {
            let message = "Un problème est survenu";
            let description = null;
            if (error.response) {
                const errorHumanReadable = createError(error);
                message = errorHumanReadable ? errorHumanReadable : error.response.data.description;
                description = null;
                // A description was sent in the response body from the backend
                return (
                    <div className="Error">
                        <Row>
                            <Col flex={"auto"}>
                                <Alert
                                    message={message}
                                    description={description}
                                    type="error"
                                />
                            </Col>
                            <Col flex={"0px"}>
                                <Button type={"link"} onClick={this.hideError} style={{position: "absolute", right: "-5px", color: "rgba(0, 0, 0, 0.85)"}}>x</Button>
                            </Col>
                        </Row>
                    </div>
                );
            }
        }
        return null

    }

}
