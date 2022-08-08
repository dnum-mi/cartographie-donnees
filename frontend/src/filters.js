const filters = {
  family: {
    categoryName: "Familles",
    selectedKey: "selectedFamily",
    listKey: 'families',
    attributeKey: 'family_name',
    color: 'blue',
    tooltip: "Famille fonctionnelle de la donnée",
    multiple: true,
  },
  organization: {
    categoryName: "Organisations",
    selectedKey: "selectedOrganization",
    listKey: 'organizations',
    titleKey: 'organization_long_name',
    selectedTitleKey: 'selectedOrganizationLong',
    attributeKey: 'organization_name',
    color: 'volcano',
    tooltip: "MOA propriétaire de la donnée",
    multiple: false,
    expandedKeys: ["MI"],
    focus: true
  },
  application: {
    categoryName: "Applications",
    selectedKey: "selectedApplication",
    listKey: 'applications',
    attributeKey: 'application_name',
    color: 'magenta',
    tooltip: "Application hébergeant la donnée",
    multiple: false,
  },
  type: {
    categoryName: "Types",
    selectedKey: "selectedType",
    listKey: 'types',
    attributeKey: 'type_name',
    color: 'red',
    tooltip: "Type de la donnée",
    multiple: false,
  },
  referentiel: {
    categoryName: "Référentiels",
    selectedKey: "selectedReferentiel",
    listKey: 'referentiels',
    attributeKey: 'referentiel_name',
    color: 'orange',
    tooltip: "Type de référentiel s’il s’agit d’une donnée référentielle (par opposition aux données opérationnelles)",
    multiple: false,
  },
  sensibility: {
    categoryName: "Sensibilités",
    selectedKey: "selectedSensibility",
    listKey: 'sensibilities',
    attributeKey: 'sensibility_name',
    color: 'lime',
    tooltip: "Sensibilité des données identifiantes",
    multiple: false,
  },
  open_data: {
    categoryName: "Open Data",
    selectedKey: "selectedOpenData",
    listKey: 'open_data',
    attributeKey: 'open_data_name',
    color: 'green',
    tooltip: "La donnée est-elle publiable en Open Data ?",
    multiple: false,
  },
  exposition: {
    categoryName: "Expositions",
    selectedKey: "selectedExposition",
    listKey: 'expositions',
    attributeKey: 'exposition_name',
    color: 'gold',
    tooltip: "Type de mises à disposition",
    multiple: true,
  },
  origin: {
    categoryName: "Origines",
    selectedKey: "selectedOrigin",
    listKey: 'origins',
    attributeKey: 'origin_name',
    color: 'geekblue',
    tooltip: "Origine fonctionnelle de la donnée",
    multiple: false,
  },
  classification: {
    categoryName: "Axes d'analyse",
    selectedKey: "selectedClassification",
    listKey: 'classifications',
    attributeKey: 'classification_name',
    color: 'purple',
    tooltip: "Types de référentiels utilisés pour classifier la donnée",
    multiple: true,
  },
  tag: {
    categoryName: "Tags",
    selectedKey: "selectedTag",
    listKey: 'tags',
    attributeKey: 'tag_name',
    color: undefined,
    tooltip: "Tags de la donnée",
    multiple: true,
  },
};

export default filters;
