import React from 'react';
import queryString from 'query-string'
import { withRouter } from 'react-router-dom';
import {Input, Tag, Pagination, Button, Collapse, Radio, Divider} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import DataSourceResult from "./results/DataSourceResult";
import './SearchPage.css';
import SearchTree from "./SearchTree";

import {
    searchDataSources, searchApplicationsOfDataSources, searchOrganizations, searchFamilies, searchTypes,
    searchReferentiels, searchSensibilities, searchOpenData, searchExpositions, searchOrigins, searchClassifications,
    searchTags, exportSearchDataSources, countDataSourcesByEnumeration
} from "../api";
import Loading from "../components/Loading";
import Error from "../components/Error";
import filters from "../filters";

const { Search } = Input;

const ANY_WORDS = "ANY_WORDS"
const ALL_WORDS = "ALL_WORDS"

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
            classifications: [],
            tags: [],
            filtersCount: null,
            strictness: ANY_WORDS
        };
        return { ...state, ...this.parseQuery() }
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
            selectedClassification: this.stringToList(values.classification),
            selectedTag: this.stringToList(values.tag),
            strictness: this.readString(values.strictness, ANY_WORDS)
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
          || this.state.selectedClassification.length !== 0
          || this.state.selectedTag.length !== 0);
    }

    readString(value) {
        return this.readString(value, null);
    }

    readString(value, defaultValue) {
        if (value) {
            return value;
        }
        else {
            return defaultValue ? defaultValue : '';
        }
    }

    stringToList(value) {
        if (value) {
            return value.split(";");
        }
        else {
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
            + "&classification=" + this.listToString(this.state.selectedClassification) + "&tag=" + this.listToString(this.state.selectedTag)
            + "&strictness=" + this.state.strictness;
    }

    componentDidMount() {
        this.setStatePromise({ homeDescription: this.isFirstTime() })
          .then(this.onSearch)
          .then(this.refreshFilters);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            let newState = { homeDescription: this.isFirstTime(), ...this.parseQuery() };
            this.setStatePromise(newState)
              .then(() => {
                  const search = this.getQuery(this.state.query);
                  this.search(search);
              })
        }
    }

    setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve()));

    refreshDataSources = (query) => searchDataSources(query || '')
        .then((response) => this.setStatePromise({ dataSources: response.data.results, total_count_data_source: response.data.total_count }));

    refreshFilterCount = (query) => countDataSourcesByEnumeration(query || '')
        .then((response) => this.setStatePromise({ filtersCount: response.data.results }));

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
        this.refreshClassifications(),
        this.refreshTags(),
    ])
    refreshFamilies = () => searchFamilies()
        .then((response) => this.setStatePromise({ families: response.data }));

    refreshTypes = () => searchTypes()
        .then((response) => this.setStatePromise({ types: response.data }));

    refreshOrganizations = () => searchOrganizations()
        .then((response) => this.setStatePromise({ organizations: response.data }));

    refreshApplications = () => searchApplicationsOfDataSources()
        .then((response) => this.setStatePromise({ applications: response.data }));

    refreshReferentiels = () => searchReferentiels()
        .then((response) => this.setStatePromise({ referentiels: response.data }));

    refreshSensibilities = () => searchSensibilities()
        .then((response) => this.setStatePromise({ sensibilities: response.data }));

    refreshOpenData = () => searchOpenData()
        .then((response) => this.setStatePromise({ open_data: response.data }));

    refreshExpositions = () => searchExpositions()
        .then((response) => this.setStatePromise({ expositions: response.data }));

    refreshOrigins = () => searchOrigins()
        .then((response) => this.setStatePromise({ origins: response.data }));

    refreshClassifications = () => searchClassifications()
        .then((response) => this.setStatePromise({ classifications: response.data }));

    refreshTags = () => searchTags()
        .then((response) => this.setStatePromise({ tags: response.data }));

    search(search) {
        this.setState({
            loading: true,
            error: null,
        });

        this.refreshDataSources(search)
            .then(() => this.refreshFilterCount(search))
            .then(() => this.setStatePromise({ loading: false, error: null }))
            .catch((error) => this.setStatePromise({ loading: false, error }));
    }

    onSearch = () => {
        const search = this.getQuery(this.state.query);
        this.props.history.push({
            search: search
        })

        return this.setStatePromise({
            homeDescription: this.isFirstTime(),
        })
            .then(() => this.search(search));
    };

    onChangePageDataSource = (page, count) => {
        this.setStatePromise({
            page_data_source: page,
            count_data_source: count,
        })
            .then(this.onSearch);
    }

    getQueryResume = () => {
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
    onFilterSelect = (key, value) => {
        let filter = this.state[key];
        const valuesToUncheck = [value];
        for (const valueToUncheck of valuesToUncheck){
            filter = filter.filter(item => item !== valueToUncheck);
        }
        this.setStatePromise({ [key]: filter, page_data_source: 1, })
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
        let sum = 0;
        for (let node of result) {
            let sumOfChildren = 0;
            const count = countObject[node.full_path] || 0;
            node.count = count
            sum += count;
            if (node.children) {
                [node.children, sumOfChildren] = this.enrichTreeWithNodeCount(node.children, countObject);
            }
            node.count += sumOfChildren;
        }
        return [result, sum];
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
        const treeData = this.state[filters[key].listKey];
        const [treeDataWithCount, _] = this.enrichTreeWithNodeCount(
          treeData,
          this.state.filtersCount[filters[key].attributeKey],
        );
        return this.sortTree(treeDataWithCount);
    };

    renderDataSourcesResults = () => {

        if (this.state.loading) {
            return <Loading />
        }
        if (this.state.error) {
            return <Error error={this.state.error} />
        }
        return (<>
            {this.renderSearchPageHeader()}
            <div className="content">
                {this.renderLeftCol()}
                <div className="right-col">
                    <div className="filters">
                        {Object.keys(filters).map((key) => (
                          <SearchTree
                            filterCategoryName={filters[key].categoryName}
                            treeData={this.getFilterData(key)}
                            tooltip={filters[key].tooltip}
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
                </div>
            </div>
        </>);
    };

    renderSearchPageHeader = () => {
        if (this.state.homeDescription) {
            return null;
        }
        else {
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
                              icon={<DownloadOutlined />}
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
        if (this.state.homeDescription) {
            return (<div className="left-col">
                <div className="home-description">
                    <h3>
                        Bienvenue dans l’outil de cartographie des données du ministère de l’intérieur !
                    </h3>
                    <p>
                        Cet outil permet d’explorer les caractéristiques des données actuellement recensées au
                        sein du ministère de l’intérieur afin de faciliter leur réutilisation au sein des différents
                        services. Comme pour un moteur de recherche classique, il est possible de combiner une recherche
                        textuelle (barre supérieure) à des filtres (présents à la droite de votre écran) pour identifier
                        les données potentiellement pertinentes à votre cas d’usage.

                    </p>
                    <p>
                        Chaque donnée possède une fiche présentant ses caractéristiques ainsi qu’un ensemble d’indicateurs
                        chiffrés visant à établir sa fiabilité et sa réutilisabilité. Outre le résultat de la recherche,
                        il est possible de naviguer d’une donnée à l’autre par le biais des applications. En effet, chaque
                        donnée est hébergée par une application existante au sein du ministère qui détaille la liste des
                        données qui lui sont associées.

                    </p>
                    <p>
                        Cherchant constamment à améliorer notre exhaustivité, n’hésitez pas à nous contacter (<i>dnum-cartographie-data@interieur.gouv.fr</i>) si vous avez
                        la moindre suggestion ou donnée qui ne serait pas encore recensée.
                    </p>
                </div>
            </div>);
        }
        else if (!this.state.dataSources.length) {
            return (
                <p className="left-col">
                    Aucun résultat trouvé, essayez d'être moins spécifique.
                </p>
            );
        }
        else {
            return (<div className="left-col">
                <div className="results">
                    {this.state.dataSources.map((dataSource) => (
                        <DataSourceResult key={dataSource.id} dataSource={dataSource}
                            onFilterSelect={(key, value) => this.onFilterSelect(key, value)}
                        />
                    ))}
                </div>
                <Pagination
                    showSizeChanger
                    current={this.state.page_data_source}
                    pageSize={this.state.count_data_source}
                    total={this.state.total_count_data_source}
                    onChange={this.onChangePageDataSource}
                />
            </div>)
        }
    }

    renderTag = (key, color) => {
        if (this.state[key]) {
            return (<Tag color={color} closable onClose={
                (e) => {
                    this.onFilterSelect(key, this.state[key])
                }
            }
                key={this.state[key]}
            >
                {this.state[key]}
            </Tag>)
        }
    }

    renderTagList = (key, color) => {
        if (this.state[key] && this.state[key].length > 0) {
            return this.state[key].map((value) => {
                return value ? (
                    <Tag
                        color={color}
                        closable
                        onClose={(e) => this.onFilterSelect(key, value)}
                        key={value}
                        title={this.getTitleFromValue(value)}
                    >
                        {value}
                    </Tag>
                ) : null;
            });
        }
    }

    getTitleFromValue(value) {
        return this.findOrganization(this.state.organizations, value)
    }

    findOrganization(organizations, fullPath) {
        let label = null;
        for(let organization of organizations) {
            if (organization.full_path === fullPath) {
                label = organization.label
            } else if (organization.children && organization.children.length > 0) {
                label = this.findOrganization(organization.children, fullPath)
            }
            if(label != null) {
                return label
            }
        }
        return label
    }

    renderDataSourceSelectedTags = () => {
        return (
            <div className="Tags">
                {
                    Object.keys(filters)
                      .map((key) => this.renderTagList(
                        filters[key].selectedKey,
                        filters[key].color,
                      ))
                      .filter((tagList) => tagList !== null)
                }
            </div>
        );
    }

    onChange = (e) => {
        this.setState({ query: e.target.value });
        if (!e.target.value) {
            this.setStatePromise({ page_data_source: 1, }).then(() => this.onSearch());
        }
    }

    onAdvancedChange = (e) => {
        this.setStatePromise({ strictness:e.target.value, page_data_source: 1, }).then(() => this.onSearch());
    }

    export = () => {
        const search = this.getQuery(this.state.query);
        exportSearchDataSources("Recherche_donnees.csv", search);
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
                                this.setStatePromise({ page_data_source: 1, })
                                    .then(() => this.onSearch());
                            }}
                        onChange={this.onChange}
                    />
                    <Collapse defaultActiveKey={this.getDefaultActiveKey()} ghost>
                        <Collapse.Panel header="Recherche avancée" key="1">
                            <div>
                                <Radio.Group onChange={this.onAdvancedChange} value={this.state.strictness} defaultValue={ANY_WORDS}>
                                    <Radio value={ANY_WORDS}>N'importe quel mot</Radio>
                                    <Radio value={ALL_WORDS}>Tous les mots</Radio>
                                </Radio.Group>
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                </div>
                <Divider/>
                {this.renderDataSourcesResults()}
            </div>
        );
    }
}

export default withRouter(SearchPage);
