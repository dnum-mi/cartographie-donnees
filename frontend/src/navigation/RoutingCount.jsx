import React from 'react';
import {withRouter} from "react-router-dom";
import {readMe, updateRoutingKPI} from "../api";
import withCurrentUser from "../hoc/user/withCurrentUser";

class RoutingCount extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        let user
        try{
            const rawUser = await readMe()
            user = rawUser.data
        } catch {
            user = null
        }

        if (!user) {
            const user_dict = {
                "is_general_admin": false,
                "is_simple_admin": false
            }
            updateRoutingKPI(user_dict, this.props.location)
        } else {
            if (!user.is_admin) {
                const user_dict = {
                    "is_general_admin": user.is_admin,
                    "is_simple_admin": true
                }
                updateRoutingKPI(user_dict, this.props.location)
            }
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.loading && this.props.location.pathname !== "/") {
            if (this.props.location.pathname !== prevProps.location.pathname || this.props.location.search !== prevProps.location.search) {
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
    }

    render() {
        return null
    }

}

export default withRouter(withCurrentUser(RoutingCount));

