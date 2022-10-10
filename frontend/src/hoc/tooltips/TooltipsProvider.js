import React, {Component} from "react";
import Tooltips from "./Tooltips"
export const tooltipsContext = React.createContext(null);

export class TooltipsProvider extends Component {
    constructor(props) {
        super(props);
    }

    render () {
        const tooltips = new Tooltips(this.props.tooltips);
        return (
            <tooltipsContext.Provider value={tooltips}>
                {this.props.children}
            </tooltipsContext.Provider>
        )
    }
}
