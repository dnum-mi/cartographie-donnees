import attributes from "../../data-source/attributes"
import filters from "../../filters";
const _ = require('lodash');

/*
Create default tooltips dictionary with all keys
Define labels/translation
Define settings sections (datasource, application, other)
 */

let defaultTooltips = {};
let defaultLabels = {};
let datasourceKeys = [];
let applicationKeys = [];
let otherKeys = [];

// Filters tooltips
for (let value of Object.values(filters)) {
    defaultTooltips[value.attributeKey] = "";
    defaultLabels[value.attributeKey] = value.categoryName;
    if (value.attributeKey !== "application_name" && value.attributeKey !== "organization_name") {
        // application_name and organization_name already in attribute.js
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
    "is_admin": "Administrateur général",
    "application_select": "Choix d'Application",
})

export { defaultLabels, datasourceKeys, applicationKeys, otherKeys }
export default defaultTooltips


// const tooltipId_to_tooltipValue = {
//     "organization_name": "MOA propriétaire de la donnée",
//     "referentiel_name": "Type de référentiel s’il s’agit d’une donnée référentielle (par opposition aux données opérationnelles)",
//     "name": "Libellé fonctionnel de la donnée",
//     "description": "Description fonctionnelle de la donnée",
//     "example": "Exemple de donnée",
//     "family_name": "Famille fonctionnelle de la donnée",
//     "classification_name": "Types de référentiels utilisés pour classifier la donnée",
//     "type_name": "Type de la donnée",
//     "is_reference": "xxxxx",
//     "origin_name": "Origine fonctionnelle de la donnée",
//     "origin_applications": "Applications sources",
//     "open_data_name": "La donnée est-elle publiable en Open Data ?",
//     "exposition_name": "Type de mises à disposition",
//     "sensibility_name": "Sensibilité des données identifiantes",
//     "tag_name": "Tags de la donnée",
//     "volumetry": "Nombre de lignes ou d’objets unitaires exploités (images, fichiers, documents…)",
//     "monthly_volumetry": "Nombre de lignes ou d’objets unitaires créés par mois",
//     "update_frequency_name": "Fréquence des mises à jour de la donnée",
//     "conservation": "Durée de conservation de la donnée",
//     "database_name": "Nom de la base ou index",
//     "database_table_name": "Nom de la table",
//     "database_table_count": "Nombre de tables dans la base contenant la donnée",
//     "fields": "Noms des champs dans la table",
//     "field_count": "Nombre de champs dans la table",
//     "application_goals": "Finalité de l\"application",
//     "application_name": "Libellé fonctionnel de l'application",
//     "application_long_name": "Libellé détaillé de l'application",
//     "access_url": "xxxx",
//     "application_organization": "MOA propriétaire de l'application",
//     "application_context_email": "Contact du gestionnaire de la donnée",
//     "data_source_count": "xxxxx",
//     "application_operator_count": "Nombre d’opérateurs de l’application (saisie, maj des données)",
//     "application_user_count": "Nombre d’utilisateurs de l’application en consultation",
//     "application_monthly_connection_count": "Nombre de connexions d’utilisateurs uniques de l’application par mois",
//     "application_historic": "Année création des données les plus anciennes",
//     "application_validation_date": "Validité de la présente cartographie pour publication",
//     "references": "xxxx",
//     "first_name": "Prénom de l'administrateur",
//     "last_name": "Nom de l'administrateur",
//     "email": "L'email de l'administrateur",
//     "is_admin": "L'utilisateur est-il administrateur général ?"
// }

// const tooltipIds = [
//     "organization_name",
//     "referentiel_name",
//     "name",
//     "description",
//     "example",
//     "family_name",
//     "classification_name",
//     "type_name",
//     "is_reference",
//     "origin_name",
//     "origin_applications",
//     "open_data_name",
//     "exposition_name",
//     "sensibility_name",
//     "tag_name",
//     "volumetry",
//     "monthly_volumetry",
//     "update_frequency_name",
//     "conservation",
//     "database_name",
//     "database_table_name",
//     "database_table_count",
//     "fields",
//     "field_count",
//     "application_goals",
//     "application_name",
//     "application_long_name",
//     "access_url",
//     "application_organization",
//     "application_context_email",
//     "data_source_count",
//     "application_operator_count",
//     "application_user_count",
//     "application_monthly_connection_count",
//     "application_historic",
//     "application_validation_date",
//     "references",
//     "first_name",
//     "last_name",
//     "email",
//     "is_admin"
// ]