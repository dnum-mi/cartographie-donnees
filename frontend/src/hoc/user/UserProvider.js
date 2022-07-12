import React, {Component} from "react";
import User from "./User";

export const CurrentUserContext = React.createContext(null);

export class UserProvider extends Component {
    constructor(props) {
        super(props);
    }

    render () {
        const currentUser = new User(this.props.user);

        return (
            <CurrentUserContext.Provider value={currentUser}>
                {this.props.children}
            </CurrentUserContext.Provider>
        )
    }
}
