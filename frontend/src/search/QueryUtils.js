import queryTitles from "./query_titles.json";
import queryString from 'query-string'

const ANY_WORDS = "ANY_WORDS";

export const parseQuery = (search) => {
    const values = queryString.parse(search);
    return {
        query: readString(values[queryTitles.query]),
        selectedOrganization: stringToList(values[queryTitles.selectedOrganization]),
        selectedFamily: stringToList(values[queryTitles.selectedFamily]),
        selectedType: stringToList(values[queryTitles.selectedType]),
        selectedApplication: stringToList(values[queryTitles.selectedApplication]),
        selectedReferentiel: stringToList(values[queryTitles.selectedReferentiel]),
        selectedSensibility: stringToList(values[queryTitles.selectedSensibility]),
        selectedOpenData: stringToList(values[queryTitles.selectedOpenData]),
        selectedExposition: stringToList(values[queryTitles.selectedExposition]),
        selectedOrigin: stringToList(values[queryTitles.selectedOrigin]),
        selectedAnalysisAxis: stringToList(values[queryTitles.selectedAnalysisAxis]),
        selectedTag: stringToList(values[queryTitles.selectedTag]),
        strictness: readString(values[queryTitles.strictness], ANY_WORDS),
        toExclude: readString(values[queryTitles.toExclude], "")
    }
}

export const readString = (value, defaultValue = null) => {
    if (value) {
        return value;
    }
    else {
        return defaultValue ? defaultValue : '';
    }
}

const stringToList = (value) => {
    if (value) {
        return value.split(";");
    }
    else {
        return [];
    }
}

export const listToString = (value) => {
    return value.join(";");
}
