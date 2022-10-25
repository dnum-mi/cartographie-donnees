import React from 'react';
import {withRouter} from "react-router-dom";
import {updateRoutingKPI} from "../api";
import withCurrentUser from "../hoc/user/withCurrentUser";

class RoutingCount extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.props.loading)
        if (!this.props.loading) {
            if (!this.props.currentUser.user.id) {
                const user_dict = {
                    "is_general_admin": false,
                    "is_simple_admin": false
                }
                updateRoutingKPI(user_dict, this.props.location)
            } else {
                if (!this.props.currentUser.userIsAdmin()) {
                    const user_dict = {
                        "is_general_admin": this.props.currentUser.userIsAdmin(),
                        "is_simple_admin": true
                    }
                    updateRoutingKPI(user_dict, this.props.location)
                }
            }
        }

    }

    render() {
        return null
    }

}

export default withRouter(withCurrentUser(RoutingCount));

