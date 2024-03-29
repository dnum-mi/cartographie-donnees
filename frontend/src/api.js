import axios from 'axios';

const API_HOST = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

/** Applications API */
export const fetchApplications = (page, count) => axios.get(API_HOST + '/applications?page=' + page + '&count=' + count);
export const searchApplications = (query, organization = '') => axios.get(API_HOST + '/applications/search?q=' + query + '&organization=' + organization);
export const searchApplicationsLimited = (query, organization = '') => axios.get(API_HOST + '/applications/search_limited?q=' + query + '&organization=' + organization);
export const createApplication = (application) => axios.post(API_HOST + '/applications', application);
export const readApplication = (applicationId) => axios.get(API_HOST + '/applications/' + applicationId);
export const updateApplication = (applicationId, application) => axios.put(API_HOST + '/applications/' + applicationId, application);
export const deleteApplication = (applicationId) => axios.delete(API_HOST + '/applications/' + applicationId);
export const importApplication = (file) => axios.post(API_HOST + '/applications/import', file, { "headers": { 'Content-Type': 'multipart/form-data' } });
export const exportApplicationUrl = API_HOST + '/applications/export';
export const countApplication = () => axios.get(API_HOST + '/applications/count');


/** Data sources API */
export const fetchDataSources = (page, count) => axios.get(API_HOST + '/data-sources?page=' + page + '&count=' + count);
export const searchDataSources = (location) =>
        axios.get(API_HOST + '/data-sources/search' + location);
export const fetchSearchMetadata = (location) =>
  axios.get(API_HOST + '/data-sources/search-metadata' + location);

export const createDataSource = (dataSource) => axios.post(API_HOST + '/data-sources', dataSource);
export const readDataSource = (dataSourceId) => axios.get(API_HOST + '/data-sources/' + dataSourceId);
export const updateDataSource = (dataSourceId, dataSource) => axios.put(API_HOST + '/data-sources/' + dataSourceId, dataSource);
export const deleteDataSource = (dataSourceId) => axios.delete(API_HOST + '/data-sources/' + dataSourceId);
export const importDataSource = (file) => axios.post(API_HOST + '/data-sources/import', file, { "headers": { 'Content-Type': 'multipart/form-data' } });
export const importDataSourceByApplication = (file, applicationId) => axios.post(API_HOST + '/data-sources/import_by_application/' + applicationId, file, { "headers": { 'Content-Type': 'multipart/form-data' } });
export const exportDataSourceUrl = API_HOST + '/data-sources/export';
export const countDataSource = () => axios.get(API_HOST + '/data-sources/count');
export const fetchDataSourceHighlights = () => axios.get(API_HOST + '/data-sources/highlights');
export const massEditDataSource = (data_source_ids, edition_type, key, value, type, required) => axios.put(API_HOST + '/data-sources/mass-edition', {data_source_ids, edition_type, key, value: value, type: type, required: required});

export const searchApplicationsOfDataSources = () => axios.get(API_HOST + '/data-sources/applications');
export const searchOrganizations = () => axios.get(API_HOST + '/data-sources/organizations');
export const searchFamilies = () => axios.get(API_HOST + '/data-sources/families');
export const searchTypes = () => axios.get(API_HOST + '/data-sources/types');
export const searchReferentiels = () => axios.get(API_HOST + '/data-sources/referentiels');
export const searchSensibilities = () => axios.get(API_HOST + '/data-sources/sensibilities');
export const searchOpenData = () => axios.get(API_HOST + '/data-sources/open-data');
export const searchExpositions = () => axios.get(API_HOST + '/data-sources/expositions');
export const searchOrigins = () => axios.get(API_HOST + '/data-sources/origins');
export const searchAnalysisAxis = () => axios.get(API_HOST + '/data-sources/analysis-axis');
export const searchTags = () => axios.get(API_HOST + '/data-sources/tags');

/** Enumerations API */
const enumEndpoint = API_HOST + '/enumerations';
export const fetchEnumerations = (category) => axios.get(category ? enumEndpoint + '?category=' + category : enumEndpoint);
export const getEnumerationCategories = () => axios.get(enumEndpoint + "/categories");
export const createEnumeration = (enumeration) => axios.post(API_HOST + '/enumerations', enumeration);
export const deleteEnumeration = (category, enumerationId) => axios.delete(API_HOST + '/enumerations/' + category + '/' + enumerationId);
export const updateEnumeration = (enumerationId, enumerationValue, enumerationLabel=undefined) => axios.put(API_HOST + '/enumerations/' + enumerationId, enumerationValue);
export const deleteEnumerationCategory = (enumerationCategory) => axios.delete(API_HOST + '/enumerations/batch/' + enumerationCategory);
export const importEnumeration = (file) => axios.post(API_HOST + '/enumerations/import', file, { "headers": { 'Content-Type': 'multipart/form-data' } });
export const exportEnumerationUrl = API_HOST + '/enumerations/export';

/** Users API */
export const fetchUsers = () => axios.get(API_HOST + '/users');
export const searchUsers = (q = '') => axios.get(API_HOST + '/users/search?q=' + q);
export const createUser = (user) => axios.post(API_HOST + '/users', user);
export const readUser = (userId) => axios.get(API_HOST + '/users/' + userId);
export const updateUser = (userId, user) => axios.put(API_HOST + '/users/' + userId, user);
export const deleteUser = (userId) => axios.delete(API_HOST + '/users/' + userId);
export const readMe = () => axios.get(API_HOST + '/users/me');
export const importUsers = (file) => axios.post(API_HOST + '/users/import', file, { "headers": { 'Content-Type': 'multipart/form-data' } });
export const exportUsersUrl = API_HOST + '/users/export';
export const countUser = () => axios.get(API_HOST + '/users/count');

/** WildCards API */
const wildCardEndpoint = API_HOST + '/wild-cards';
export const fetchWildCards = (namespace) => axios.get(namespace ? wildCardEndpoint + '/' + namespace : wildCardEndpoint);
export const updateWildCards = (wild_card_list) => axios.post(wildCardEndpoint, {"data":wild_card_list});
export const importWildCards = (file) => axios.post(wildCardEndpoint + '/import', file, { "headers": { 'Content-Type': 'multipart/form-data' } });
export const exportWildCardsUrl = wildCardEndpoint + '/export';

/* KPI API */
export const updateRoutingKPI = (user, location) => axios.post(API_HOST + '/kpi/routing', {"user":user, "location":location});
export const fetchRoutingKPI = (start_date, end_date) => axios.get(API_HOST + '/kpi/routing?start_date=' + start_date + '&end_date=' + end_date);
export const fetchSearchingKPI = (start_date, end_date) => axios.get(API_HOST + '/kpi/searching?start_date=' + start_date + '&end_date=' + end_date);
export const fetchAdminKPI = () => axios.get(API_HOST + '/kpi/admin');
export const fetchCountKPI = () => axios.get(API_HOST + '/kpi/count');
export const deleteYearBrowsingKPI = () => axios.delete(API_HOST + '/kpi/year');
export const exportRoutingKPIUrl = API_HOST + '/kpi/routing/export';
export const exportSearchingKPIUrl = API_HOST + '/kpi/searching/export';

/** Auth API */
export const login = (email, password) => axios.post(API_HOST + '/login', { email, password });
export const logout = () => axios.post(API_HOST + '/logout');
export const forgotPassword = (email) => axios.post(API_HOST + '/auth/forgot-password', { email });
export const resetPassword = (token, password) => axios.post(API_HOST + '/auth/reset-password', { token, password });

/** Export */
export const exportModel = (url, name) => axios.get(url, { "responseType": "blob" }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', name);
        document.body.appendChild(link);
        link.click();
});

export const exportSearchDataSources = (name, location) =>
        axios.get(
                API_HOST + '/data-sources/export_search' + location
                , { "responseType": "blob" }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', name);
                        document.body.appendChild(link);
                        link.click();
                });

export const exportDataSourcesOfApplication = (name, application_id) =>
        axios.get(
                API_HOST + '/data-sources/export/' + application_id
                , { "responseType": "blob" }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', name);
                        document.body.appendChild(link);
                        link.click();
                });
