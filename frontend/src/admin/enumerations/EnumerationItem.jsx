import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { updateEnumeration } from "../../api";
import './EnumerationItem.css';


class EnumerationItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            value: this.props.item.value,
            edit: false,
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

        return (
            <div className="EnumerationItem">
                <div className="content">
                    <Button
                        type="link"
                        title={"Supprimer le filtre \"" + this.state.value + "\""}
                        icon={<DeleteOutlined/>}
                        loading={this.state.loading}
                        onClick={() => this.deleteEnumerationFromApi()}
                    />
                    {balise}
                </div>
            </div>
        );
    }
}

export default withRouter(EnumerationItem);
