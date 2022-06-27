import React from "react";
import { Collapse, Tree } from 'antd';
import { withRouter } from "react-router-dom";
import { QuestionCircleOutlined } from '@ant-design/icons';
const { Panel } = Collapse;

class SearchTree extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            expandedKeys : this.props.expandedKeys,
            selectedKeys : this.props.selectedKeys,
            autoExpandParent : true,
        }
    }

    flatTree = (treeData) => {
        let result = [];
        for (let node of treeData) {
            result.push(node.full_path);
            if (node.children) {
                result = result.concat(this.flatTree(node.children));
            }
        }
        return result;
    }

    addChildren = (keys) => {
        console.log('addChildren');
        console.log(keys);
        let result = [...keys];
        for (let key of keys) {
            const children = this.flatTree(this.props.treeData)
              .filter((k) => (k !== key && k.indexOf(key) === 0))
            result = result.concat(children)
        }
        return result;
    }

    filterOutChildren = (keys) => {
        let result = [...keys];
        for (let key of keys) {
            const keyIsChild = keys
              .map((k) => key !== k && key.indexOf(k) === 0)
              .reduce((acc, isChild) => acc || isChild, false);
            if (keyIsChild) {
                result = result.filter((k) => k !== key)
            }
        }
        return result;
    }

    setExpandedKeys = (expandedKeys) => {
        this.setState({
            expandedKeys
        })
    }

    setAutoExpandParent = (value) =>{
        this.setState({
            autoExpandParent : value
        })
    }

    onExpand = (expandedKeys) => {
        this.setExpandedKeys(expandedKeys);
        this.setAutoExpandParent(false);
    };

    onCheck = (checkedKeys) => {
        this.props.onSelectedFiltersChange(this.filterOutChildren(checkedKeys));
    };

    onClickHeader = (key) => {
        if (key.length === 0){
            this.setState({ complete: false })
        }
    }

    render(){
        return(
            <Collapse
                className="SearchFilter"
                onChange={this.onClickHeader}
            >
                <Panel
                    header={<span>{this.props.filterCategoryName+" "}<QuestionCircleOutlined title={this.props.tooltip}/></span>}
                    key={this.props.filterCategoryName}
                    className={this.props.color}
                >
                    <Tree
                        checkable
                        multiple={this.props.multiple}
                        onExpand={this.onExpand}
                        expandedKeys={this.state.expandedKeys}
                        autoExpandParent={this.state.autoExpandParent}
                        onCheck={this.onCheck}
                        checkedKeys={this.addChildren(this.props.checkedKeys)}
                        treeData={this.props.treeData}
                        fieldNames={{ title: 'value', key: 'full_path', children: 'children' }}
                    />
                </Panel>
            </Collapse>
        )
    }
}

export default withRouter(SearchTree);
