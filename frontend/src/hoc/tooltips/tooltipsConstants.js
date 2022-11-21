import attributes from "../../data-source/attributes"
import filters from "../../filters";
const _ = require('lodash');

let defaultTooltips = {};
let defaultLabels = {};
let datasourceKeys = [];
let applicationKeys = [];
let otherKeys = [];

// Filters tooltips
for (let value of Object.values(filters)) {
    defaultTooltips[value.attributeKey] = "";
    defaultLabels[value.attributeKey] = value.categoryName;
    if (value.attributeKey != "application_name") {
        datasourceKeys.push(value.attributeKey)
    }
}

// Datasources tooltips
for (let value of Object.values(_.omit(attributes, "application"))) {
    defaultTooltips[value.attributeId] = "";
    defaultLabels[value.attributeId] = value.label;
    datasourceKeys.push(value.attributeId)

    if (value.hasSuffixValue) {
        defaultTooltips[value.suffixAttributeId] = "";
        defaultLabels[value.suffixAttributeId] = value.suffixAttributeLabel;
        datasourceKeys.push(value.suffixAttributeId)
    }
}
datasourceKeys = _.uniq(datasourceKeys)

// Application tooltips
for (let value of Object.values(attributes.application)) {
    defaultTooltips[value.attributeId] = "";
    defaultLabels[value.attributeId] = value.label;
    applicationKeys.push(value.attributeId)

    if (value.hasSuffixValue) {
        defaultTooltips[value.suffixAttributeId] = "";
        defaultLabels[value.suffixAttributeId] = value.suffixAttributeLabel;
        applicationKeys.push(value.suffixAttributeId)
    }
}
applicationKeys.push("application_select")

// Other tooltips
otherKeys = [
    "first_name",
    "last_name",
    "email",
    "is_admin"
]

_.assign(defaultTooltips, {
    "first_name": "",
    "last_name": "",
    "email": "",
    "is_admin": "",
    "application_select": ""
})

_.assign(defaultLabels, {
    "first_name": "Prénom",
    "last_name": "Nom",
    "email": "Email",
    "is_admin": "Administrateur ?",
    "application_select": "Choix d'Application",
})

export { defaultLabels, datasourceKeys, applicationKeys, otherKeys }
export default defaultTooltips
