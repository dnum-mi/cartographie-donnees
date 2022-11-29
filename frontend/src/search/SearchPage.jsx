import React from 'react';
import queryString from 'query-string'
import {withRouter} from 'react-router-dom';
import {Button, Col, Divider, Input, Radio, Row, Skeleton, Tag} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import './SearchPage.css';
import SearchTree from "./SearchTree";

import {
    exportSearchDataSources,
    fetchSearchMetadata,
    searchAnalysisAxis,
    searchApplicationsOfDataSources,
    searchDataSources,
    searchExpositions,
    searchFamilies,
    searchOpenData,
    searchOrganizations,
    searchOrigins,
    searchReferentiels,
    searchSensibilities,
    searchTags,
    searchTypes,
} from "../api";
import Error from "../components/Error";
import filters from "../filters";
import Results from "./Results";

import withTooltips from '../hoc/tooltips/withTooltips';
import withCurrentUser from "../hoc/user/withCurrentUser";
import MassEdition from "./MassEdition";

const {Search} = Input;

const ANY_WORDS = "ANY_WORDS"
const ALL_WORDS = "ALL_WORDS"

// TODO Create an api route to mass edit

class SearchPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getInitState();
    }

    getInitState = () => {
        let state = {
            loading: true,
            error: null,
            homeDescription: true,
            dataSources: [],
            total_count_data_source: 1,
            page_data_source: 1,
            count_data_source: 50,
            applications: [],
            organizations: [],
            families: [],
            types: [],
            referentiels: [],
            sensibilities: [],
            open_data: [],
            expositions: [],
            origins: [],
            analysis_axiss: [],
            tags: [],
            filtersCount: null,
            strictness: ANY_WORDS,
            toExlude: "",
            showEditionSection: false,
            selectedDatasources: {},
            resultDatasourceIds: []
        };
        return {...state, ...this.parseQuery()}
    }

    parseQuery = () => {
        const values = queryString.parse(this.props.location.search);
        return {
            query: this.readString(values.q),
            selectedOrganization: this.stringToList(values.organization),
            selectedFamily: this.stringToList(values.family),
            selectedType: this.stringToList(values.type),
            selectedApplication: this.stringToList(values.application),
            selectedReferentiel: this.stringToList(values.referentiel),
            selectedSensibility: this.stringToList(values.sensibility),
            selectedOpenData: this.stringToList(values.open_data),
            selectedExposition: this.stringToList(values.exposition),
            selectedOrigin: this.stringToList(values.origin),
            selectedAnalysisAxis: this.stringToList(values.analysis_axis),
            selectedTag: this.stringToList(values.tag),
            strictness: this.readString(values.strictness, ANY_WORDS),
            toExclude: this.readString(values.toExclude, "")
        }
    }

    isFirstTime = () => {
        return !(this.state.query
            || this.state.selectedOrganization.length !== 0
            || this.state.selectedFamily.length !== 0
            || this.state.selectedType.length !== 0
            || this.state.selectedApplication.length !== 0
            || this.state.selectedReferentiel.length !== 0
            || this.state.selectedSensibility.length !== 0
            || this.state.selectedOpenData.length !== 0
            || this.state.selectedExposition.length !== 0
            || this.state.selectedOrigin.length !== 0
            || this.state.selectedAnalysisAxis.length !== 0
            || this.state.selectedTag.length !== 0);
    }

    readString(value, defaultValue = null) {
        if (value) {
            return value;
        } else {
            return defaultValue ? defaultValue : '';
        }
    }

    stringToList(value) {
        if (value) {
            return value.split(";");
        } else {
            return [];
        }
    }

    listToString(value) {
        return value.join(";");
    }

    getQuery(query) {
        return "?q=" + this.readString(query) + "&page=" + this.state.page_data_source + "&count=" + this.state.count_data_source
            + "&family=" + this.listToString(this.state.selectedFamily)
            + "&type=" + this.listToString(this.state.selectedType) + "&organization=" + this.listToString(this.state.selectedOrganization)
            + "&application=" + this.listToString(this.state.selectedApplication) + "&referentiel=" + this.listToString(this.state.selectedReferentiel)
            + "&sensibility=" + this.listToString(this.state.selectedSensibility) + "&open_data=" + this.listToString(this.state.selectedOpenData)
            + "&exposition=" + this.listToString(this.state.selectedExposition) + "&origin=" + this.listToString(this.state.selectedOrigin)
            + "&analysis_axis=" + this.listToString(this.state.selectedAnalysisAxis) + "&tag=" + this.listToString(this.state.selectedTag)
            + "&strictness=" + this.state.strictness + "&toExclude=" + this.state.toExclude;
    }

    componentDidMount() {
        this.refreshFilters().then(
            this.launchSearch)
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.setState({selectedDatasources:{}})
            this.launchSearch()
        }
    }

    launchSearch = () => {
        let newState = {homeDescription: this.isFirstTime(), ...this.parseQuery()};
        return this.setStatePromise(newState)
            .then(() => {
                const search = this.getQuery(this.state.query);
                this.search(search);
            })
    }

    search(search) {
        this.setState({
            loading: true,
            error: null,
        });

        this.refreshDataSources(search)
            .then(() => this.refreshFilterCount(search))
            .then(() => this.setState({loading: false, error: null}))
            .catch((error) => this.setState({loading: false, error}));
    }

    setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve()));

    refreshDataSources = (query) => searchDataSources(query || '')
        .then((response) => this.setStatePromise({
            dataSources: response.data.results,
            total_count_data_source: response.data.total_count
        }));

    refreshFilterCount = (query) => fetchSearchMetadata(query || '')
        .then((response) => this.setStatePromise({
            filtersCount: response.data.count_by_enum,
            resultDatasourceIds: response.data.datasource_ids
        }));

    refreshFilters = () => Promise.all([
        this.refreshOrganizations(),
        this.refreshFamilies(),
        this.refreshTypes(),
        this.refreshApplications(),
        this.refreshReferentiels(),
        this.refreshSensibilities(),
        this.refreshOpenData(),
        this.refreshExpositions(),
        this.refreshOrigins(),
        this.refreshAnalysisAxis(),
        this.refreshTags(),
    ])
    refreshFamilies = () => searchFamilies()
        .then((response) => this.setStatePromise({families: response.data}));

    refreshTypes = () => searchTypes()
        .then((response) => this.setStatePromise({types: response.data}));

    refreshOrganizations = () => searchOrganizations()
        .then((response) => this.setStatePromise({organizations: response.data}));

    refreshApplications = () => searchApplicationsOfDataSources()
        .then((response) => this.setStatePromise({applications: response.data}));

    refreshReferentiels = () => searchReferentiels()
        .then((response) => this.setStatePromise({referentiels: response.data}));

    refreshSensibilities = () => searchSensibilities()
        .then((response) => this.setStatePromise({sensibilities: response.data}));

    refreshOpenData = () => searchOpenData()
        .then((response) => this.setStatePromise({open_data: response.data}));

    refreshExpositions = () => searchExpositions()
        .then((response) => this.setStatePromise({expositions: response.data}));

    refreshOrigins = () => searchOrigins()
        .then((response) => this.setStatePromise({origins: response.data}));

    refreshAnalysisAxis = () => searchAnalysisAxis()
        .then((response) => this.setStatePromise({analysis_axis: response.data}));

    refreshTags = () => searchTags()
        .then((response) => this.setStatePromise({tags: response.data}));


    //Modify url based on state, then componentDidUpdate will be called to actually do the search
    onSearch = () => {
        const search = this.getQuery(this.state.query);
        this.props.history.push({
            search: search
        })
    };


    onChangePageDataSource = (page, count) => {
        this.setStatePromise({
            page_data_source: page,
            count_data_source: count,
        })
            .then(this.onSearch);
    }

    getQueryResume = () => {
        if (this.state.loading) {
            return <></>
        }
        const firstPage = 1 + (this.state.page_data_source - 1) * this.state.count_data_source;
        const lastPage = this.state.page_data_source * this.state.count_data_source;
        const totalElement = this.state.total_count_data_source;
        return 'Données '
            + Math.min(firstPage, totalElement).toString()
            + ' à '
            + Math.min(lastPage, totalElement).toString()
            + ' sur '
            + totalElement.toString();
    }

    //cliked on tag X below searchbar
    removeFilter = (key, value) => {
        let filter = this.state[key];
        const valuesToUncheck = [value];
        for (const valueToUncheck of valuesToUncheck) {
            filter = filter.filter(item => item !== valueToUncheck);
        }
        this.setStatePromise({[key]: filter, page_data_source: 1,})
            .then(() => this.onSearch());
    }

    addFilter = (key, value) => {
        let filter = this.state[key];

        if (!filter.includes(value)) {
            filter = [...filter, value];
        }
        this.setStatePromise({[key]: filter, page_data_source: 1,})
            .then(() => this.onSearch());
    }

    onSelectedFiltersChange = (key, value) => {
        this.setStatePromise({
            [key]: value,
            page_data_source: 1,
        })
            .then(() => this.onSearch());
    }

    enrichTreeWithNodeCount = (treeData, countObject) => {
        const result = JSON.parse(JSON.stringify(treeData));
        for (let node of result) {
            const count = countObject[node.full_path] || 0;
            node.count = count
            if (node.children) {
                node.children = this.enrichTreeWithNodeCount(node.children, countObject);
            }
        }
        return result;
    };

    sortTree = (treeData) => {
        const result = JSON.parse(JSON.stringify(treeData));
        result.sort((a, b) => b.count - a.count);
        for (let node of result) {
            if (node.children && node.children.length) {
                node.children = this.sortTree(node.children);
            }
        }
        return result;
    };

    getFilterData = (key) => {
        if (!this.state.filtersCount) {
            return null;
        }
        const treeData = this.state[filters[key].listKey];
        const treeDataWithCount = this.enrichTreeWithNodeCount(
            treeData,
            this.state.filtersCount[filters[key].attributeKey],
        );
        return this.sortTree(treeDataWithCount);
    };

    renderDataSourcesResults = () => {
        if (this.state.error) {
            return <Error error={this.state.error}/>
        }
        return (<>
            {this.renderSearchPageHeader()}
            <div className="content">
                <div className="left-col">
                    {this.renderLeftCol()}
                </div>
                <div className="right-col">
                    {this.renderRightCol()}
                </div>
            </div>
        </>);
    };

    renderLoading = () => {
        return (
            <div style={{marginRight: "10px"}}>
                <Skeleton loading={true} active/>
                <Skeleton loading={true} active/>
                <Skeleton loading={true} active/>
            </div>
        )
    }

    renderRightCol = () => {
        return (
            <div className="filters">
                {Object.keys(filters).map((key) => (
                    <SearchTree
                        key={key}
                        loading={this.state.loading}
                        filterCategoryName={filters[key].categoryName}
                        treeData={this.getFilterData(key)}
                        tooltip={this.props.tooltips.get(filters[key].tooltipKey || filters[key].attributeKey)}
                        color={filters[key].color}
                        multiple={filters[key].multiple}
                        expandedKeys={filters[key].expandedKeys}
                        focus={filters[key].focus}
                        onSelectedFiltersChange={(value) => this.onSelectedFiltersChange(filters[key].selectedKey, value)}
                        checkedKeys={this.state[filters[key].selectedKey]}
                        resultsCount={this.state.total_count_data_source}
                    />
                ))}
            </div>
        )
    }

    renderSearchPageHeader = () => {
        if (this.state.homeDescription) {
            return null;
        } else {
            return (
                <div>
                    <div className='search-header'>
                        <span>
                            {this.getQueryResume()}
                        </span>
                        <div className="download-search">
                            <Button
                                onClick={this.export}
                                type="secondary"
                                icon={<UploadOutlined/>}
                                disabled={!this.state.dataSources.length}
                            >
                                Télécharger les résultats
                            </Button>
                        </div>
                    </div>
                    <div>
                        {this.renderDataSourceSelectedTags()}
                    </div>
                </div>
            )
        }
    }

    renderLeftCol = () => {
        if (this.state.loading) {
            return this.renderLoading();
        } else if (this.state.homeDescription) {
            return (
                <div className="home-description">
                    <h3>
                        {this.props.homepageContent["welcome_title"]}
                    </h3>
                    <div>
                        {this.props.homepageContent["welcome_text"]}
                    </div>
                    <br/>
                    <a href={"mailto:" + this.props.homepageContent["welcome_email"]}>
                        {this.props.homepageContent["welcome_email"]}
                    </a>
                </div>
            );
        } else {
            return <Results dataSources={this.state.dataSources}
                            page_data_source={this.state.page_data_source}
                            count_data_source={this.state.count_data_source}
                            total_count_data_source={this.state.total_count_data_source}
                            onChangePageDataSource={this.onChangePageDataSource}
                            addFilter={this.addFilter}
                            showEditionSection={this.state.showEditionSection}
                            onCheckDatasource={this.onCheckDatasource}
                            selectedDatasources={this.state.selectedDatasources}
            />;
        }
    }

    renderTagList = (key, color) => {
        if (this.state[key] && this.state[key].length > 0) {
            return this.state[key].map((value) => {
                return value ? (
                    <Tag
                        color={color}
                        closable
                        onClose={(e) => this.removeFilter(key, value)}
                        key={value}
                        title={this.getTitleFromValue(key, value)}
                    >
                        {value}
                    </Tag>
                ) : null;
            });
        }
    }

    getTitleFromValue(key, value) {
        if (key === "selectedApplication") {
            return this.findApplication(this.state.applications, value)
        }
        if (key === "selectedOrganization") {
            return this.findOrganization(this.state.organizations, value)
        }
        return null
    }

    findOrganization(organizations, fullPath) {
        let label = null;
        for (let organization of organizations) {
            if (organization.full_path === fullPath) {
                label = organization.label
            } else if (organization.children && organization.children.length > 0) {
                label = this.findOrganization(organization.children, fullPath)
            }
            if (label != null) {
                return label
            }
        }
        return label
    }


    findApplication(applications, fullPath) {
        for (let application of applications) {
            if (application.full_path === fullPath) {
                return application.label
            }
        }
        return null
    }

    renderDataSourceSelectedTags = () => {
        return (
            <div className="Tags">
                {
                    Object.keys(filters)
                        .map((key) => this.renderTagList(
                            filters[key].selectedKey,
                            filters[key].color
                        ))
                        .filter((tagList) => tagList !== null)
                }
            </div>
        );
    }

    onChange = (e) => {
        this.setState({query: e.target.value});
        if (!e.target.value) {
            this.setStatePromise({page_data_source: 1,}).then(() => this.onSearch());
        }
    }

    onRuleChange = (e) => {
        this.setStatePromise({strictness: e.target.value, page_data_source: 1,}).then(() => this.onSearch());
    }

    onExcludeChange = (e) => {
        this.setStatePromise({toExclude: e.target.value, page_data_source: 1,}).then(() => this.onSearch());
    }

    export = () => {
        const search = this.getQuery(this.state.query);
        exportSearchDataSources("Recherche_donnees.csv", search);
    }

    onCheckDatasource = (datasourceId, check) => {
        const temp_selectedDatasources = {...this.state.selectedDatasources}
        if (!!check) {
            temp_selectedDatasources[datasourceId] = true
            this.setState({selectedDatasources: temp_selectedDatasources})
        } else {
            delete temp_selectedDatasources[datasourceId]
            this.setState({selectedDatasources: temp_selectedDatasources})
        }
    }

    onCheckUncheckAll = (checkAll=true) => {
        const temp_datasourceIds = {}
        if (!!checkAll) {
            for (const datasourceId of this.state.resultDatasourceIds) {
                temp_datasourceIds[datasourceId] = true
            }
        }
        this.setState({selectedDatasources: temp_datasourceIds})
    }

    getDefaultActiveKey = () => {
        if (this.state.strictness === ANY_WORDS) {
            return []
        } else {
            return ["1"]
        }
    }

    render() {
        return (
            <div className="SearchPage container">
                <div className="search-input">
                    <Search
                        placeholder="Recherche"
                        size="large"
                        value={this.state.query}
                        defaultValue={this.props.match.params.q}
                        onSearch={
                            (e) => {
                                this.setStatePromise({page_data_source: 1,})
                                    .then(() => this.onSearch());
                            }}
                        onChange={this.onChange}
                    />
                    <Row className="search-advanced-input">
                        <Col span={12}>
                            <label htmlFor="search-type">
                                Règle sur la recherche :
                            </label>
                            <Radio.Group
                                id="search-type"
                                onChange={this.onRuleChange}
                                value={this.state.strictness}
                                defaultValue={ANY_WORDS}
                            >
                                <Radio value={ANY_WORDS}>N'importe quel mot</Radio>
                                <Radio value={ALL_WORDS}>Tous les mots</Radio>
                            </Radio.Group>
                        </Col>
                        <Col span={12}>
                            <label htmlFor="search-exclusion">
                                Mots à exclure :
                            </label>
                            <Input
                                id="search-exclusion"
                                placeholder="Mots à exclure de la recherche"
                                defaultValue={this.state.toExclude}
                                onBlur={this.onExcludeChange}
                                onPressEnter={this.onExcludeChange}
                            />
                        </Col>
                    </Row>
                </div>
                {this.props.currentUser.userIsAdmin() && !this.state.homeDescription &&
                    <MassEdition onShowModificationSection={(checked) => this.setState({showEditionSection: checked})}
                                 showEditionSection={this.state.showEditionSection}
                                 selectedDatasources={this.state.selectedDatasources}
                                 onCheckUncheckAll={this.onCheckUncheckAll}
                                 totalCount = {this.state.total_count_data_source}
                    />
                }
                <Divider style={{marginTop: 0}}/>
                {this.renderDataSourcesResults()}
            </div>
        );
    }
}

export default withRouter(withCurrentUser(withTooltips(SearchPage)));
