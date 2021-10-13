import React from "react";
import { withRouter, Link } from "react-router-dom";
import { Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import './SearchFilter.css';
const { Panel } = Collapse;

class SearchFilter extends React.Component {

    constructor(props) {
        super(props);
           this.state = {
                complete: false,
                unroll: false
            }
    }

    onClickHeader = (key) => {
        if (key.length == 0){
            this.setState({complete:false})
        }
    }

    render() {
        let numberEnumerationInMore = 0;
        for (const filter_id in this.props.filters){
            const filter = this.props.filters[filter_id];
            for (const enumeration_id in filter.enumerations){
                const enumeration = filter.enumerations[enumeration_id];
                numberEnumerationInMore += enumeration.count;
            }
        }
        const total_number = this.props.number_of_data_source;

        let currentValue = this.props.currentValue;

        if (!currentValue || currentValue === ""){
                currentValue = [];
        }
        else if (typeof currentValue === 'string'){
            currentValue = [currentValue];
        }

        var panels = [];
        for (const filter_id in this.props.filters){
            const filter = this.props.filters[filter_id];

            const number_to_show = 4;
            const number_not_show = filter.enumerations.length - number_to_show - 1

            var rows = [];
            for (const enumeration_id in filter.enumerations){
                const enumeration = filter.enumerations[enumeration_id];
                if (currentValue.includes(enumeration.value)){
                    var className = "filter-row selected ";
                }
                else {
                    var className = "filter-row ";
                }
                if (!this.state.complete && enumeration_id > number_to_show){
                    rows.push(
                        <div className="more-choice"
                            onClick={ () => {
                                this.setState({
                                    complete:true
                                })
                            }}
                        >
                            <span>{"Plus de choix (" + number_not_show + ")..."}</span>
                            <span>{numberEnumerationInMore + "/" + total_number}</span>
                        </div>
                    )
                    break
                }
                else {
                    numberEnumerationInMore -= enumeration.count;
                    rows.push(
                        <div onClick={ () => this.props.onFilterSelect(enumeration.value)}
                                        className={className}
                                        key={enumeration.value}
                        >
                            <span className="filter-label">
                                {enumeration.value}
                            </span>
                            <span className="filter-count">
                                {enumeration.count + "/" + total_number}
                            </span>
                        </div>
                    )
                }
            }
            panels.push(
                <Panel
                    header={<span>{filter.category+" "}<QuestionCircleOutlined title={this.props.tooltip}/></span>}
                    key={filter.category}
                    className={this.props.color}
                >
                    {rows}
                </Panel>
            )

        }

        var activeKey;
        if (currentValue.length !== 0){
            activeKey = this.props.filters.map((filter) => filter.category)
        }
        return (
            <Collapse
                className="SearchFilter"
                defaultActiveKey={activeKey}
                onChange={this.onClickHeader}
            >
                {panels}
            </Collapse>
        );
    }
};

export default withRouter(SearchFilter);
