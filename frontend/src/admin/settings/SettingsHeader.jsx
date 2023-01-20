import React from 'react';
import {Button, Form, Upload, Alert} from "antd";
import {CloseOutlined, CheckOutlined, EditOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';

import './SettingsHeader.css';
import Error from "../../components/Error";


class SettingsHeader extends React.Component {

  constructor(props) {
    super(props);
}

  readModeRow() {
    return (
      <div className="actions">

        <Button loading={this.props.submitLoading} type="primary" onClick={(e) => this.props.onActivateEdition(e)} icon={<EditOutlined />}>
          Modifier les paramètres
        </Button>

        <Button onClick={(e) => this.props.onExport(e)} icon={<UploadOutlined/>} type="default" disabled={this.props.submitLoading}>Export</Button>

        <Upload
              customRequest={this.props.onUploadfile}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<DownloadOutlined/>} type="default" disabled={this.props.submitLoading}>Import</Button>
        </Upload>

      </div>
    )
  }

  editModeRow() {
    return (
      <div className="actions">

        <Form.Item noStyle>
            <Button loading={this.props.submitLoading} type="primary" htmlType="submit" icon={<CheckOutlined />}>
                Valider les modifications
            </Button>
        </Form.Item>

        <Button onClick={(e) => this.props.onCancelEdition(e)} danger icon={<CloseOutlined />} disabled={this.props.submitLoading}>
          Annuler les modifications
        </Button>

      </div>
    )
  }

  renderSuccessAlert() {
      return (
          <Alert type={"success"} message={"Les paramètres ont été modifiés avec succès"} showIcon closable/>
      )
  }

  render() {
    return (
        <>
            <div className="SettingsHeader">
                {this.props.editMode ? this.editModeRow() : this.readModeRow()}
            </div>
            {/*Seperate div to avoid sticky behavior*/}
            <div className="settingsAlert">
                <Error error={this.props.error}/>
                {this.props.success && this.renderSuccessAlert()}
            </div>
        </>

    );
  }
}

export default SettingsHeader;
