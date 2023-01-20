import React from 'react';
import { withRouter } from 'react-router-dom';
import {Button, Divider, Input} from 'antd';

import './EnumerationCategory.css';
import EnumerationItem from "./EnumerationItem";
import Loading from "../../components/Loading";
import {PlusOutlined} from "@ant-design/icons";
import { createEnumeration, fetchEnumerations, deleteEnumeration } from "../../api";


class EnumerationCategory extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            newValue: '',
            newValueInputKey: Math.random(),
            items: [],
        };
    }
    componentDidMount() {
        this.fetchEnumerationsFromApi();
    }

    fetchEnumerationsFromApi = () => {
        this.setState({
            loading: true
        });
        fetchEnumerations(this.props.category)
            .then((response) => {
                this.setState({
                    items: response.data,
                    loading: false
                });
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    error,
                });
                this.props.onError(error)
            });
    };
    createItem = () => {
        if (this.state.newValue){
            this.setState({
                loading: true
            });
            createEnumeration({
                category: this.props.category,
                full_path: this.state.newValue,
            })
                .then(() => {
                    this.setState({
                        loading: false
                    });
                    this.fetchEnumerationsFromApi();
                })
                .catch((error) => {
                    this.setState({
                        loading: false
                    });
                    this.props.onError(error)
                });
        }
    };

    deleteEnumerationApi = (id) => {
        this.setState({
            loading: true
        });
        deleteEnumeration(this.props.category, id)
        .then((response) => {
            this.setState({
                loading: false
            });
            this.fetchEnumerationsFromApi();
        })
        .catch((error) => {
            this.setState({
                loading: false
            });
            this.props.onError(error)
        });
    }

    render() {
        if (this.state.loading) {
            return <Loading />;
        }
        return (
            <div className="EnumerationsCategory">
                {this.state.items.map((item) => {
                    item["category"] = this.props.category;
                    return (
                        <EnumerationItem
                          key={item.id}
                          item={item}
                          onDelete={this.deleteEnumerationApi}
                          onError={this.props.onError}
                          fetch={this.fetchEnumerationsFromApi}
                        />
                    )})}
                <div className="actions">
                    <Input
                        onChange={(e) => this.setState({
                            newValue: e.target.value,
                        })}
                        key={this.state.newValueInputKey}
                        onPressEnter={this.createItem}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={this.createItem}
                        loading={this.state.loading}
                    >
                        Nouvelle entrée
                    </Button>
                </div>
            </div>
        );
    }
}

export default withRouter(EnumerationCategory);
