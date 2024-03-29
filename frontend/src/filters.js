const filters = {
  family: {
    categoryName: "Famille",
    selectedKey: "selectedFamily",
    listKey: 'families',
    attributeKey: 'family_name',
    color: 'blue',
    tooltip: "Famille fonctionnelle de la donnée",
    multiple: true,
  },
  organization: {
    categoryName: "Organisation",
    selectedKey: "selectedOrganization",
    listKey: 'organizations',
    titleKey: 'organization_long_name',
    selectedTitleKey: 'selectedOrganizationLong',
    attributeKey: 'organization_name',
    tooltipKey: 'application_organization',
    color: 'volcano',
    tooltip: "MOA propriétaire de la donnée",
    multiple: false,
    expandedKeys: ["MI"],
    focus: true
  },
  application: {
    categoryName: "Application",
    selectedKey: "selectedApplication",
    listKey: 'applications',
    attributeKey: 'application_name',
    color: 'magenta',
    tooltip: "Application hébergeant la donnée",
    multiple: false,
  },
  type: {
    categoryName: "Type",
    selectedKey: "selectedType",
    listKey: 'types',
    attributeKey: 'type_name',
    color: 'red',
    tooltip: "Type de la donnée",
    multiple: false,
  },
  referentiel: {
    categoryName: "Référentiel",
    selectedKey: "selectedReferentiel",
    listKey: 'referentiels',
    attributeKey: 'referentiel_name',
    color: 'orange',
    tooltip: "Type de référentiel s’il s’agit d’une donnée référentielle (par opposition aux données opérationnelles)",
    multiple: false,
  },
  sensibility: {
    categoryName: "Sensibilité",
    selectedKey: "selectedSensibility",
    listKey: 'sensibilities',
    attributeKey: 'sensibility_name',
    color: 'lime',
    tooltip: "Sensibilité des données identifiantes",
    multiple: false,
  },
  open_data: {
    categoryName: "OpenData",
    selectedKey: "selectedOpenData",
    listKey: 'open_data',
    attributeKey: 'open_data_name',
    color: 'green',
    tooltip: "La donnée est-elle publiable en Open Data ?",
    multiple: false,
  },
  exposition: {
    categoryName: "Exposition",
    selectedKey: "selectedExposition",
    listKey: 'expositions',
    attributeKey: 'exposition_name',
    color: 'gold',
    tooltip: "Type de mises à disposition",
    multiple: true,
  },
  origin: {
    categoryName: "Origine",
    selectedKey: "selectedOrigin",
    listKey: 'origins',
    attributeKey: 'origin_name',
    color: 'geekblue',
    tooltip: "Origine fonctionnelle de la donnée",
    multiple: false,
  },
  analysis_axis: {
    categoryName: "Axes d'analyse",
    selectedKey: "selectedAnalysisAxis",
    listKey: 'analysis_axis',
    attributeKey: 'analysis_axis_name',
    color: 'purple',
    tooltip: "Types de référentiels utilisés pour classifier la donnée",
    multiple: true,
  },
  tag: {
    categoryName: "Tag",
    selectedKey: "selectedTag",
    listKey: 'tags',
    attributeKey: 'tag_name',
    color: undefined,
    tooltip: "Tags de la donnée",
    multiple: true,
  },
};

export default filters;
