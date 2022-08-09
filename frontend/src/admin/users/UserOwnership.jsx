import React from 'react';
import {fetchApplications, fetchApplicationsByOwner} from '../../api';
import PropTypes from "prop-types";
import {Form, Input, Tag} from "antd";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import ApplicationSearchTag from "../../components/ApplicationSearchTag";
const _ = require("lodash");

class UserOwnership extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            applications: [],
        }
    }

    componentDidMount() {
        this.fetchApplicationsFromApi();
    }

    fetchApplicationsFromApi() {
        this.setState({
            loading: true,
            error: null,
        });

        fetchApplications(1,-1)
            .then((response) => {
                let results = response.data.results;
                let ownedApplications = [];
                results.forEach((application) => {
                    application.owners.forEach((owner) => {
                        if(owner.id === this.props.user.id){
                            ownedApplications.push({ id: application.id, name: application.name})
                        }
                    })
                })

                this.setState({
                    applications: ownedApplications,
                    loading: false,
                    error: null,
                    total_count: response.data.total_count,
                });
            })
            .catch((error) => {
                this.setState({
                    applications: [],
                    loading: false,
                    error,
                });
            });
    }



    render() {
        const {applications} = this.state;
        if (this.state.loading) {
            return <Loading />;
        }
        if (this.state.error) {
            return <Error error={this.state.error} />;
        }

        return  <Form.Item
            label="Applications"
            name="ownedApplications"
            initialValue = {applications}

        >
            <ApplicationSearchTag
                limited={false}
            />
        </Form.Item>
    }


}

// UserOwnership.defaultProps = {
//     allowClear : false
// }
//
// UserOwnership.propTypes = {
//     value: PropTypes.object,
//     defaultValue: PropTypes.object,
//     mode: PropTypes.string,
//     onChange: PropTypes.func,
//     allowClear: PropTypes.bool
// };

export default UserOwnership;
