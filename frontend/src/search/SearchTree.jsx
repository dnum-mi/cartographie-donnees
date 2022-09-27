import React from "react";
import {Collapse, Skeleton, Tree} from 'antd';
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
            autoExpandParent : true,
            expanded: false,
        }
    }

    isExpanded = () => !this.hasMoreChoices() || this.state.expanded;

    hasMoreChoices = () => this.props.treeData && this.props.treeData.length > this.props.countToShow;

    nodeCount = (tree) => {
        let result = 0;
        for (let node of tree) {
            result += 1;  // Count this node
            if (node.children && node.children.length > 0) {
                result += this.nodeCount(node.children);
            }
        }
        return result;
    }

    nodeCountSum = (tree) => {
        let result = 0;
        for (let node of tree) {
            result += node.count;
            if (node.children && node.children.length > 0) {
                result += this.nodeCountSum(node.children);
            }
        }
        return result;
    }

    hiddenTree = () => this.props.treeData.filter((val, i) => i >= this.props.countToShow);

    numberNotShown = () => {
        if (!this.props.treeData || this.props.loading) {
            return "...";
        }
        return this.nodeCount(this.hiddenTree());
    };

    countOfNotShown = () => {
        if (!this.props.treeData || this.props.loading) {
            return <>.../...</>;
        }
        return <>{this.nodeCountSum(this.hiddenTree())} / {this.props.resultsCount}</>;
    };

    renderTreeCount = (node) => {
        if (this.props.loading) {
            return <>.../...</>;
        }
        return <>{node.count}/{this.props.resultsCount}</>;
    }

    convertTitles = (treeData) => {
        return treeData.map((node) => {
            node.titleComponent = (
              <div className="search-tree-row" title={node.label || node.value}>
                  <span className="search-tree-label">
                      {node.value}
                  </span>
                  <span className="search-tree-count">
                      {this.renderTreeCount(node)}
                  </span>
              </div>
            );
            if (node.children && node.children.length) {
                node.children = this.convertTitles(node.children);
            }
            return node;
        });
    };

    prepareTreeData = (treeData) => {
        const filteredTree = this.filterMoreChoices(treeData);
        return this.convertTitles(filteredTree);
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

    onCheck = (checkedKeys, newNode) => {
        const checked = [...this.props.checkedKeys];
        if (newNode.node.halfChecked) { // if newNode was halfchecked
            // check all childs
            // remove all from state, done in render
            for(const child of newNode.node.children) {
                const index = checked.indexOf(child.full_path);
                if (index > -1) {
                    checked.splice(index, 1);
                }
            }
            // check newNode
            checked.push(newNode.node.full_path)
            // half check parent
            // remove from state, done in render
            for(const node of newNode.checkedNodes) {
                //find parents
                if (newNode.node.full_path.includes(node.full_path) && !(newNode.node.full_path===node.full_path)) {
                    const index = checked.indexOf(node.full_path);
                    if (index > -1) {
                        checked.splice(index, 1);
                    }
                }
            }
        } else if (newNode.node.checked) {// if newNode was checked
            // uncheck newNode
            const index = checked.indexOf(newNode.node.full_path);
            if (index > -1) {
                checked.splice(index, 1);
            }
            // uncheck all childs
            for(const child of newNode.node.children) {
                const index = checked.indexOf(child.full_path);
                if (index > -1) {
                    checked.splice(index, 1);
                }
            }
            // half / uncheck parents
            // remove from state, done in render
            for(const node of newNode.checkedNodes) {
                //find parents
                if (newNode.node.full_path.includes(node.full_path) && !(newNode.node.full_path===node.full_path)) {
                    const index = checked.indexOf(node.full_path);
                    if (index > -1) {
                        checked.splice(index, 1);
                    }
                }
            }
        } else { // if newNode was unchecked
            // check newNode
            checked.push(newNode.node.full_path);
            // check all child
            // remove from state, done in render
            for(const child of newNode.node.children) {
                const index = checked.indexOf(child.full_path);
                if (index > -1) {
                    checked.splice(index, 1);
                }
            }
            // half check parent
            // parent can't be checked, done in render
        }
        // send real checks
        this.props.onSelectedFiltersChange(checked);
    };

    parseAllFromRequest = () => {
        const realChecks = this.props.checkedKeys;
        let fakeChecks = [...realChecks];
        let fakeHalfChecks = [];
        for (const real of realChecks) {
            const nodes = this.findNode(real, this.props.treeData);
            const node = nodes[0];
            const rest = nodes.slice(1);
            // add children of checked to halfchecked
            fakeHalfChecks = fakeHalfChecks.concat(this.flattenChildren(node).map((node) => node.full_path));
            // add parents of checked to half-checked
            fakeHalfChecks = fakeHalfChecks.concat(rest.map((treenode) => treenode.full_path));
        }
        return {
            checked: fakeChecks,
            halfChecked: fakeHalfChecks
        }
    }

    flattenChildren = (node) => {
        const ret = [];
        for (const child of node.children) {
            ret.push(child);
            ret.concat(this.flattenChildren(child   ));
        }
        return ret;
    }

    findNode = (nodePath, tree) => {
        for (const node of tree) {
            if (node.full_path === nodePath) {
                return [node];
            }
            const found = this.findNode(nodePath, node.children);
            if (found) {
                return [...found, node];
            }
        }
        return null;
    }

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
                Plus de choix ({this.numberNotShown()})...
            </span>
            <span>
                {this.countOfNotShown()}
            </span>
        </div>
    )

    isActiveKey = () => {
        return (this.props.focus || this.props.checkedKeys.length > 0)
            ? this.props.filterCategoryName : undefined
    }

    renderTree = () => {
        if (!this.props.treeData) {
            return (
                <div style={{margin: "10px"}}>
                    <Skeleton loading={true} active />
                    <Skeleton loading={true} active />
                    <Skeleton loading={true} active />
                </div>
            )
        } else {
            return (
                <>
                    <Tree
                    checkable
                    blockNode
                    checkStrictly={true}
                    multiple={this.props.multiple}
                    onExpand={this.onExpand}
                    expandedKeys={this.state.expandedKeys}
                    autoExpandParent={this.state.autoExpandParent}
                    onCheck={this.onCheck}
                    checkedKeys={this.parseAllFromRequest()}
                    treeData={this.prepareTreeData(this.props.treeData)}
                    fieldNames={{ title: 'titleComponent', key: 'full_path', children: 'children' }}
                    />
                    {!this.isExpanded() && this.renderMoreChoices()}
                </>
            )
        }
    }

    render() {
        return(
            <Collapse
                className="SearchTree"
                onChange={this.onClickHeader}
                defaultActiveKey={this.isActiveKey()}
            >
                <Panel
                    header={<span>{this.props.filterCategoryName+" "}<QuestionCircleOutlined title={this.props.tooltip}/></span>}
                    key={this.props.filterCategoryName}
                    className={this.props.color}
                >
                    {this.renderTree()}
                </Panel>
            </Collapse>
        )
    }
}

SearchTree.defaultProps = {
    countToShow: 5,
    focus: false,
    expandedKeys: []
}

SearchTree.propTypes = {
    filterCategoryName: PropTypes.string,
    treeData: PropTypes.array,
    tooltip: PropTypes.string,
    countToShow: PropTypes.number,
    expandedKeys: PropTypes.array,
    multiple: PropTypes.bool,
    focus: PropTypes.bool,
    onSelectedFiltersChange: PropTypes.func,
    resultsCount: PropTypes.number,
    checkedKeys: PropTypes.arrayOf(PropTypes.string),
}

export default withRouter(SearchTree);
