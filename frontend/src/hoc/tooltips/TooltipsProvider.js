import React, {Component} from "react";
import Tooltips from "./Tooltips"
export const tooltipsContext = React.createContext(null);

export class TooltipsProvider extends Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <tooltipsContext.Provider value={this.props.tooltips}>
                {this.props.children}
            </tooltipsContext.Provider>
        )
    }
}
