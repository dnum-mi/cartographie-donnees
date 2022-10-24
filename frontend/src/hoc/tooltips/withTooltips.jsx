import React, { Component } from 'react';
import { tooltipsContext } from './TooltipsProvider'

/*
    Injects the currentUser props to given component
 */
export default function withTooltips(ComponentToExtend) {
    return class tooltipsHOC extends Component {
        render () {
            return (
                <tooltipsContext.Consumer>
                    { state => <ComponentToExtend {...this.props} tooltips={ state } /> }
                </tooltipsContext.Consumer>
            )
        }
    }
};
