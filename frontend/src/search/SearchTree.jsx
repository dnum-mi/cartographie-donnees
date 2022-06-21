import React from "react";
import { Collapse, notification, Tree } from 'antd';
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

    searchPage2antd =() => {
        var searchPageKeys = this.props.searchPageCheckedKeys;
        var antdKeys = searchPageKeys;
        antdKeys.push(this.addChildrenToList(this.props.treeData));
        return antdKeys;
    }

    antd2searchPage = (antdCheckedKeys) =>{
        var sortedKeys = [];
        //lets sort antdcheckeds Keys by depth
        for(let i = 0; i< antdCheckedKeys.length; i++){
            var count = (antdCheckedKeys[i].match(/>/g) || []).length;
            if(!sortedKeys[count]){
                sortedKeys[count] = [];
            }
            sortedKeys[count].push(antdCheckedKeys[i]);
        }
        //if no key of depth 0 is checked, we initialize the array
        if(!sortedKeys[0]){
            sortedKeys[0] = [];
        }
        //lets assume all keys of depth 0 will be kept

        //lets loop through the others to check if a parent is already kept in sortedKeys[0]
        //if not lets keep them
        for (let i =1; i<sortedKeys.length; i++){
            for(let j = 0; j<sortedKeys[i].length;j++){
                var temp_currentKey = sortedKeys[i][j];
                var parentAlreadyInList = false;
                var parents = sortedKeys[i][j].split(' > ');
                var k = 0;
                //let's look for every parent of the current key in the already kept keys
                while(k<parents.length-1 && !parentAlreadyInList){
                    var temp_parent = parents[0];
                    for(let l=1; l<=k;l++){
                        temp_parent=temp_parent +' > '+ parents[l];
                    }
                    var m =0;
                    while(m<sortedKeys[0].length && !parentAlreadyInList){
                        if(sortedKeys[0][m].includes(temp_parent)){
                            parentAlreadyInList = true;
                        }
                        m++;
                    }
                    k++;
                }
                //if no parent of the currentkey has been found in the kept keys, we keep the currentkey
                if(!parentAlreadyInList){
                    sortedKeys[0].push(temp_currentKey);
                }
            }
        }
        return sortedKeys[0];
    }

    addChildrenToList(treeData, parent_node_selected=false){
        var level_length = Object.keys(treeData).length;
        var to_return = [];
        for(let i = 0; i<level_length; i++){
            var current_node = treeData[i];
            var current_node_checked = this.props.searchPageCheckedKeys.includes(current_node.key);
            if(parent_node_selected || current_node_checked){
                to_return.push([current_node.key]);
            }              
            if(Object.keys(current_node.children).length >0){
                to_return.push([this.addChildrenToList(current_node.children, parent_node_selected || current_node_checked)]);
            }
        }
        return to_return;
    }

    setExpandedKeys = (expandedKeysValue) => {
        this.setState({
            expandedKeys:expandedKeysValue
        })
    }

    setAutoExpandParent = (value) =>{
        this.setState({
            autoExpandParent : value
        })
    }

    setCheckedKeys = (checkedKeysValue) =>{
        debugger;
        console.log("Checked key (from SearchTree)" + checkedKeysValue);
        this.props.onSelectedFiltersChange(this.antd2searchPage(checkedKeysValue));
    }

    setSelectedKeys = (selectedKeysValue, info) =>{
        console.log(info);
        this.setState({
            selectedKeys : selectedKeysValue
        })
    }

    onExpand = (expandedKeysValue) => {
        console.log('onExpand', expandedKeysValue); // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.

        this.setExpandedKeys(expandedKeysValue);
        this.setAutoExpandParent(false);
    };

    onCheck = (checkedKeysValue) => {
        //console.log('onCheck', checkedKeysValue);
        this.setCheckedKeys(checkedKeysValue);
    };

    onSelect = (selectedKeysValue, info) => {
        console.log('onSelect', info);
        this.setSelectedKeys(selectedKeysValue);
    };

    onClickHeader = (key) => {
        if (key.length == 0){
            this.setState({complete:false})
        }
    } 

    render(){
        //this.searchPage2antd();
        return(
            <Collapse
                className = "SearchFilter"
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
                    checkedKeys={this.searchPage2antd()}
                    onSelect={this.onSelect}
                    selectedKeys={this.state.selectedKeys}
                    treeData={this.props.treeData}
                    //checkStrictly = {true}
                />
                </Panel>
            
            </Collapse>
        )
    }
}

export default withRouter(SearchTree);
