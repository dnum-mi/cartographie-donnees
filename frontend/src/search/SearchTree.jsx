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
        if (!this.props.treeData) {
            return null;
        }
        return this.nodeCount(this.hiddenTree());
    };

    countOfNotShown = () => {
        if (!this.props.treeData) {
            return null;
        }
        return this.nodeCountSum(this.hiddenTree());
    };

    convertTitles = (treeData) => {
        return treeData.map((node) => {
            node.titleComponent = (
              <div className="search-tree-row" title={node.label || node.value}>
                  <span className="search-tree-label">
                      {node.value}
                  </span>
                  <span className="search-tree-count">
                      {node.count}/{this.props.resultsCount}
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

    addChildren = (keys) => {
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
                Plus de choix ({this.numberNotShown()})...
            </span>
            <span>
                {this.countOfNotShown()} / {this.props.resultsCount}
            </span>
        </div>
    )

    isActiveKey = () => {
        return (this.props.focus || this.props.checkedKeys.length > 0)
            ? this.props.filterCategoryName : undefined
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
                    <Tree
                        checkable
                        blockNode
                        multiple={this.props.multiple}
                        onExpand={this.onExpand}
                        expandedKeys={this.state.expandedKeys}
                        autoExpandParent={this.state.autoExpandParent}
                        onCheck={this.onCheck}
                        checkedKeys={this.addChildren(this.props.checkedKeys)}
                        treeData={this.prepareTreeData(this.props.treeData)}
                        fieldNames={{ title: 'titleComponent', key: 'full_path', children: 'children' }}
                    />
                    {!this.isExpanded() && this.renderMoreChoices()}
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
