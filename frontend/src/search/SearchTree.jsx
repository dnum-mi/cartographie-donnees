import React from "react";
import { Collapse, Tree } from 'antd';
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { QuestionCircleOutlined } from '@ant-design/icons';
import './SearchTree.css';
const { Panel } = Collapse;

class SearchTree extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            expandedKeys : this.props.expandedKeys,
            selectedKeys : this.props.selectedKeys,
            autoExpandParent : true,
            expanded: false,
        }
    }

    isExpanded = () => !this.hasMoreChoices() || this.state.expanded;

    hasMoreChoices = () => this.props.treeData && this.props.treeData.length > this.props.countToShow;

    nodeCount = (tree) => {
        let result = 0;
        for (let root of tree) {
            result += 1;  // Count this root
            if (root.children && root.children.length > 0) {
                result += this.nodeCount(root.children);
            }
        }
        return result;
    }

    number_not_shown = () => {
        if (!this.props.treeData) {
            return null;
        }
        const hiddenTree = this.props.treeData.filter((val, i) => i >= this.props.countToShow);
        return this.nodeCount(hiddenTree);
    };

    prepareTreeData = (treeData) => {
        return this.filterMoreChoices(treeData);
    };

    filterMoreChoices = (treeData) => {
        if (!treeData) {
            return [];
        }
        if (this.isExpanded()) {
            return treeData
        }
        return treeData.filter((val, i) => i < this.props.countToShow);
    };

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

    renderMoreChoices = () => (
        <div
          className="more-choice"
          onClick={() => {
              this.setState({
                  expanded: true,
              });
          }}
        >
            <span>
                Plus de choix ({this.number_not_shown()})...
            </span>
            <span>
                - / -
            </span>
        </div>
    )

    render() {
        return(
            <Collapse
                className="SearchTree"
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
                        treeData={this.prepareTreeData(this.props.treeData)}
                        fieldNames={{ title: 'value', key: 'full_path', children: 'children' }}
                    />
                    {!this.isExpanded() && this.renderMoreChoices()}
                </Panel>
            </Collapse>
        )
    }
}

SearchTree.defaultProps = {
    countToShow: 5,
}

SearchTree.propTypes = {
    filterCategoryName: PropTypes.string,
    treeData: PropTypes.array,
    tooltip: PropTypes.string,
    countToShow: PropTypes.number,
    multiple: PropTypes.bool,
    onSelectedFiltersChange: PropTypes.func,
    checkedKeys: PropTypes.arrayOf(PropTypes.string),
}

export default withRouter(SearchTree);
