import React, { Component } from 'react';
import { CurrentUserContext } from './UserProvider'

/*
    Injects the currentUser props to given component
 */
export default function withCurrentUser(ComponentToExtend) {
    return class CurrentUserHOC extends Component {
        render () {
            return (
                <CurrentUserContext.Consumer>
                    { state => <ComponentToExtend {...this.props} currentUser={ state } /> }
                </CurrentUserContext.Consumer>
            )
        }
    }
};
