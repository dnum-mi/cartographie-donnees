import React from 'react';
import { withRouter } from 'react-router-dom';
import {Button, Divider, Modal} from 'antd';
import {DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import { updateEnumeration } from "../../api";
import './EnumerationItem.css';

const {confirm} = Modal;

class EnumerationItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            value: this.props.item.value,
            edit: false,
            valueLong: this.props.item.label,
            editLong: false,
        };
    }

    deleteEnumerationFromApi() {
        this.props.onDelete(this.props.item.id);
    }

    updateEnumerationFromApi() {
        this.setState({
            loading: true,
        });
        updateEnumeration(this.props.item.id, {
            category: this.props.item.category,
            full_path: this.state.value,
            label: this.state.valueLong
        })
            .then(() => {
                this.setState({
                    loading: false,
                });
                this.props.error();
                this.props.fetch();
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                });
                this.props.error(error);
                this.props.fetch()
            });
    }


    handleDoubleClick = (e) => {
        this.setState({
          edit: true,
          value: e.target.textContent
        });
    }
    handleBlur = (e) => {
        this.setState({
          edit: false,
          value: this.props.item.value
        });
    }

    handleEnter = (e) =>{
        if (e.code === "Enter" || e.charCode === 13 || e.which === 13) {
            this.updateEnumerationFromApi()
            this.setState({
                edit: false
            });
        }
    }

    handleDoubleClickLong = (e) => {
        this.setState({
            editLong: true,
            valueLong: e.target.textContent
        });
    }
    handleBlurLong = (e) => {
        this.setState({
            editLong: false,
            valueLong: this.props.item.value
        });
    }

    handleEnterLong = (e) =>{
        if (e.code === "Enter" || e.charCode === 13 || e.which === 13) {
            this.updateEnumerationFromApi()
            this.setState({
                editLong: false
            });
        }
    }

    showConfirmationDelete = () => {
        var self = this;
        return confirm({
            title: 'Etes vous sûr de vouloir supprimer ce filtre ?',
            icon: <ExclamationCircleOutlined />,
            content: 'Cette action est irreversible',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                self.deleteEnumerationFromApi()
            },
            onCancel() {
                //do nothing
            },
        });
    }

    render() {
        let balise;
        if (this.state.edit) {
            balise = (
                <input
                    value={this.state.value}
                    onBlur={this.handleBlur}
                    onKeyPress={this.handleEnter}
                    onChange={(e) => this.setState({
                        value: e.target.value,
                    })}
                    type="text"
                />
              )
        } else {
            balise = (
              <span onClick={this.handleDoubleClick}>
                  {this.props.item.full_path}
              </span>
            );
        }
        let baliseLong;
        if (this.state.editLong && this.props.item.label) {
            baliseLong = (
                <input
                    value={this.state.valueLong}
                    onBlur={this.handleBlurLong}
                    onKeyPress={this.handleEnterLong}
                    onChange={(e) => this.setState({
                        valueLong: e.target.value,
                    })}
                    type="text"
                    style={{"width": "500px"}}
                />
            )
        } else {
            baliseLong = (
                <span onClick={this.handleDoubleClickLong}>
                  {this.props.item.label}
              </span>
            );
        }

        return (
            <div className="EnumerationItem">
                <div className="content">
                    <Button
                        type="link"
                        title={"Supprimer le filtre \"" + this.state.value + "\""}
                        icon={<DeleteOutlined/>}
                        loading={this.state.loading}
                        onClick={this.showConfirmationDelete}
                    />
                    {balise}
                    <Divider type="vertical"/>
                    {baliseLong}
                </div>
            </div>
        );
    }
}

export default withRouter(EnumerationItem);
