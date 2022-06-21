import React from 'react';
import queryString from 'query-string'
import { withRouter } from 'react-router-dom';
import { Tabs, Input, Select, Tag, Pagination, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import DataSourceResult from "./results/DataSourceResult";
import ApplicationResult from './results/ApplicationResult';
import './SearchPage.css';
import SearchFilter from "./SearchFilter";
import SearchTree from "./SearchTree";

import {
    searchDataSources, searchApplicationsOfDataSources, searchOrganizations, searchFamilies, searchTypes,
    searchReferentiels, searchSensibilities, searchOpenData, searchExpositions, searchOrigins, searchClassifications,
    searchTags, exportSearchDataSources
} from "../api";
import Loading from "../components/Loading";
import Error from "../components/Error";

const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;



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
            openData: [],
            expositions: [],
            origins: [],
            classifications: [],
            tags: [],
        };
        return { ...state, ...this.parseQuery() }
    }

    parseQuery = () => {
        const values = queryString.parse(this.props.location.search);
        console.log("parsequery "+this.stringToList(values.family));
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
            selectedTag: this.stringToList(values.tag)
        }
    }

    isFirstTime = () => {
        if (this.state.query || this.state.selectedOrganization || this.state.selectedFamily.length !== 0 ||
            this.state.selectedType.length !== 0 || this.state.selectedApplication.length !== 0 || this.state.selectedReferentiel.length !== 0 ||
            this.state.selectedSensibility.length !== 0 || this.state.selectedOpenData.length !== 0 || this.state.selectedExposition.length !== 0 ||
            this.state.selectedOrigin.length !== 0 || this.state.selectedClassification.length !== 0 || this.state.selectedTag.length !== 0) {
            return false;
        }
        else {
            return true;
        }
    }

    readString(value) {
        if (value) {
            return value;
        }
        else {
            return '';
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
        // debugger;
        // console.log("list to string "+value);
        // if(value['checked']){
        //     return value['checked'].join(";");
        // }
        return value.join(";");
    }

    getQuery(query) {
        return "?q=" + this.readString(query) + "&page=" + this.state.page_data_source + "&count=" + this.state.count_data_source
            + "&family=" + this.listToString(this.state.selectedFamily)
            + "&type=" + this.listToString(this.state.selectedType) + "&organization=" + this.listToString(this.state.selectedOrganization)
            + "&application=" + this.listToString(this.state.selectedApplication) + "&referentiel=" + this.listToString(this.state.selectedReferentiel)
            + "&sensibility=" + this.listToString(this.state.selectedSensibility) + "&open_data=" + this.listToString(this.state.selectedOpenData)
            + "&exposition=" + this.listToString(this.state.selectedExposition) + "&origin=" + this.listToString(this.state.selectedOrigin)
            + "&classification=" + this.listToString(this.state.selectedClassification) + "&tag=" + this.listToString(this.state.selectedTag);
    }

    componentDidMount() {
        this.setStatePromise({ homeDescription: this.isFirstTime() })
            .then(this.onSearch).then(() => {console.log(this.state['selectedFamily'])});
    }

    async componentDidUpdate(prevProps) {
        setTimeout(function () { }, 1000)
        if (this.props.location.search !== prevProps.location.search) {
            let newState = { ...{ homeDescription: this.isFirstTime() }, ...this.parseQuery() };
            this.setStatePromise(newState).then(() => {
                const search = this.getQuery(this.state.query);
                this.search(search);
            }
            )
        }
    }

    setStatePromise = (newState) => new Promise((resolve) => this.setState(newState, () => resolve()));

    refreshDataSources = (query) => searchDataSources(query || '')
        .then((response) => this.setStatePromise({ dataSources: response.data.results, total_count_data_source: response.data.total_count }));

    refreshFamilies = (query) => searchFamilies(query || '')
        .then((response) => this.setStatePromise({ families: response.data }));

    refreshTypes = (query) => searchTypes(query || '')
        .then((response) => this.setStatePromise({ types: response.data }));

    refreshOrganizations = (query) => searchOrganizations(query || '')
        .then((response) => this.setStatePromise({ organizations: response.data }));

    refreshApplications = (query) => searchApplicationsOfDataSources(query || '')
        .then((response) => this.setStatePromise({ applications: response.data }));

    refreshReferentiels = (query) => searchReferentiels(query || '')
        .then((response) => this.setStatePromise({ referentiels: response.data }));

    refreshSensibilities = (query) => searchSensibilities(query || '')
        .then((response) => this.setStatePromise({ sensibilities: response.data }));

    refreshOpenData = (query) => searchOpenData(query || '')
        .then((response) => this.setStatePromise({ open_data: response.data }));

    refreshExpositions = (query) => searchExpositions(query || '')
        .then((response) => this.setStatePromise({ expositions: response.data }));

    refreshOrigins = (query) => searchOrigins(query || '')
        .then((response) => this.setStatePromise({ origins: response.data }));

    refreshClassifications = (query) => searchClassifications(query || '')
        .then((response) => this.setStatePromise({ classifications: response.data }));

    refreshTags = (query) => searchTags(query || '')
        .then((response) => this.setStatePromise({ tags: response.data }));

    search(search) {
        this.setState({
            loading: true,
            error: null,
        });

        this.refreshDataSources(search)
            .then(() => this.refreshOrganizations(search))
            .then(() => this.refreshFamilies(search))
            .then(() => this.refreshTypes(search))
            .then(() => this.refreshApplications(search))
            .then(() => this.refreshReferentiels(search))
            .then(() => this.refreshSensibilities(search))
            .then(() => this.refreshOpenData(search))
            .then(() => this.refreshExpositions(search))
            .then(() => this.refreshOrigins(search))
            .then(() => this.refreshClassifications(search))
            .then(() => this.refreshTags(search))
            .then((response) => this.setStatePromise({ loading: false, error: null }))
            .catch((error) => this.setStatePromise({ loading: false, error }));
    }

    onSearch = () => {
        const search = this.getQuery(this.state.query);
        this.props.history.push({
            search: search
        })

        this.setStatePromise({
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
        const queryResume = 'Données ' + Math.min(firstPage, totalElement).toString() + ' à ' + Math.min(lastPage, totalElement).toString() + ' sur ' + totalElement.toString();
        return queryResume;
    }

    //cliked on tag X below searchbar
    onFilterSelect = (key, value) => {
        console.log("onFilterSelect "+key);
        let filter;
        console.log('On filter select '+value)
        filter = this.state[key];
        var valuesToUncheck = [value];
        // while(value.lastIndexOf('>') != -1){
        //     var lastIndexOf = value.lastIndexOf('>');
        //     var tmp_parent = value.slice(0, lastIndexOf).trim();
        //     valuesToUncheck.push(tmp_parent);
        //     value=tmp_parent;
        // }
        for (const valueToUncheck of valuesToUncheck){
            filter = filter.filter(item => item !== valueToUncheck);
        } 
        this.setStatePromise({ [key]: filter, page_data_source: 1, })
            .then(() => this.onSearch());
    }

    onSelectedFiltersChange = (key, value) => {
        console.log('received '+key+' '+value);
        console.log("key "+key+" before setstate "+this.state[key]);
        this.setStatePromise({ [key]: value, page_data_source: 1, })
            .then(() => this.onSearch());

        console.log("key "+key+" after setstate "+this.state[key]);
    }
    
    renderFilter = (name, list, key, color, tooltip, multiple=false) => {
        return (
            <SearchTree 
                filterCategoryName = {name}
                treeData = {list}
                tooltip = {tooltip}
                color = {color}
                multiple={multiple}
                onSelectedFiltersChange = {value => this.onSelectedFiltersChange(key,value)}
               //expandedKeys={this.state[key]}
                searchPageCheckedKeys={this.state[key]}
            //selectedKeys={}   
            />
        )
    }

    renderDataSourcesResults = () => {

        if (this.state.loading) {
            return <Loading />
        }
        if (this.state.error) {
            return <Error error={this.state.error} />
        }
        const filters = [];
        filters.push(this.renderFilter("Familles", this.state.families, "selectedFamily", "blue", "Famille fonctionnelle de la donnée", true))
        filters.push(this.renderFilter("Organisations", this.state.organizations, "selectedOrganization", "volcano", "MOA propriétaire de la donnée"))
        filters.push(this.renderFilter("Applications", this.state.applications, "selectedApplication", "magenta", "Application hébergeant la donnée"))
        filters.push(this.renderFilter("Types", this.state.types, "selectedType", "red", "Type de la donnée"))
        filters.push(this.renderFilter("Référentiels", this.state.referentiels, "selectedReferentiel", "orange", "Type de référentiel s’il s’agit d’une donnée référentielle (par opposition aux données opérationnelles)"))
        filters.push(this.renderFilter("Sensibilités", this.state.sensibilities, "selectedSensibility", "lime", "Sensibilité des données identifiantes"))
        filters.push(this.renderFilter("Open Data", this.state.open_data, "selectedOpenData", "green", "La donnée est-elle publiable en Open Data ?"))
        filters.push(this.renderFilter("Expositions", this.state.expositions, "selectedExposition", "gold", "Type de mises à disposition", true))
        filters.push(this.renderFilter("Origines", this.state.origins, "selectedOrigin", "geekblue", "Origine fonctionnelle de la donnée"))
        filters.push(this.renderFilter("Axes d'analyse", this.state.classifications, "selectedClassification", "purple", "Types de référentiels utilisés pour classifier la donnée", true))
        filters.push(this.renderFilter("Tags", this.state.tags, "selectedTag", undefined, "Tags de la donnée", true))
        return (<>
            {this.renderSearchPageHeader()}
            <div className="content">
                {this.renderLeftCol()}
                <div className="right-col">
                    <div className="filters">
                        {filters}
                    </div>
                </div>
            </div>
        </>);
    };

    renderSearchPageHeader = () => {
        if (this.state.homeDescription) {
            return;
        }
        else {
            return (
                <div>
                    <div className='search-header'>
                        <span>
                            {this.getQueryResume()}
                        </span>
                        <div className="download-search">
                            <Button onClick={this.export} type="secondary" icon={<DownloadOutlined />} disabled={!this.state.dataSources.length}>Télécharger les résultats</Button>
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
                if(value != ''){
                    return (<Tag color={color} closable onClose={(e) => {
                                                this.onFilterSelect(key, value)
                                            }
                                        }
                                        key={value}
                                    >
                                        {value}
                                    </Tag>);
            }});
        }
       // return null;
    }

    renderDataSourceSelectedTags = () => {
        var tags = [];
        const tagNames = ["selectedFamily","selectedOrganization","selectedApplication", "selectedType","selectedReferentiel", "selectedSensibility","selectedOpenData", "selectedExposition",
        "selectedOrigin","selectedClassification", "selectedTag"]
        const colors = ["blue", "volcano", "magenta", "red",  "orange", "lime", "green", "gold", "geekblue", "purple", ""]
        for(let i =0; i<tagNames.length;i++){
            var temp = this.renderTagList(tagNames[i], colors[i]);
            if(temp != null){
                tags.push(temp);
            }
        }
        return (
            <div className="Tags">
                {tags}
            </div>
        );
    }

    onChange = (e) => {
        this.setState({ query: e.target.value });
        if (!e.target.value) {
            this.setStatePromise({ page_data_source: 1, }).then(() => this.onSearch());
        }
    }

    export = () => {
        const search = this.getQuery(this.state.query);
        exportSearchDataSources("Recherche_donnees.csv", search);
    }

    render() {
        return (
            <div className="SearchPage">
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
                </div>
                {this.renderDataSourcesResults()}
            </div>
        );
    }
}

export default withRouter(SearchPage);
