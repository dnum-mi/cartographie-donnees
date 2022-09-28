import React from 'react';
import { Col, Row, Button, Form, Upload} from "antd";
import {CloseOutlined, CheckOutlined, EditOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import './SettingsHeader.css';


class SettingsHeader extends React.Component {

  constructor(props) {
    super(props);
}

  readModeRow() {
    return (
      <div className="actions">

        <Button type="primary" onClick={(e) => this.props.onActivateEdition(e)} icon={<EditOutlined />}>
          Modifier les paramètres
        </Button>

        <Button onClick={(e) => this.props.onExport(e)} icon={<DownloadOutlined/>} type="default">Export</Button>

        <Upload
              customRequest={this.props.onUploadfile}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined/>} type="default">Import</Button>
        </Upload>

      </div>
    )
  }

  editModeRow() {
    return (
      <div className="actions">

        <Form.Item noStyle>
            <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                Valider les modifications
            </Button>
        </Form.Item>
      
        <Button onClick={(e) => this.props.onCancelEdition(e)} danger icon={<CloseOutlined />}>
          Annuler les modifications
        </Button>

      </div>
    )
  }

  render() {
    return (
      <div className="SettingsHeader">
          {this.props.editMode ? this.editModeRow() : this.readModeRow()}
      </div>
    );
  }
}

export default SettingsHeader;
