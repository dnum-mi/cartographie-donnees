import React from "react";
import {PlusOutlined} from "@ant-design/icons";
import {Button} from "antd";

export default class ApplicationAdd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
    }
    onCreateApplicationClick = () => {
        if (!this.props.applicationCreationMode) {
            this.props.onAddApplicationClick()
        }
    }


    render() {
        return (
            <Button shape="circle" icon={<PlusOutlined />} onClick={this.onCreateApplicationClick}/>
        );
    }
}
