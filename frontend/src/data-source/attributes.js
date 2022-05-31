export default {
  name: {
    attributeId: 'name',
    label: 'Nom',
    headingLevel: 1,
    type: 'text',
    tooltip: 'Nom de la donnée',
  },
  description: {
    attributeId: 'description',
    label: 'Description',
    type: 'text',
    isTextArea: true,
    tooltip: 'Description de la donnée',
  },
  example: {
    attributeId: 'example',
    label: 'Exemple',
    type: 'text',
    isTextArea: true,
    tooltip: 'Exemple',
  },
  family_name: {
    attributeId: 'family_name',
    label: 'Familles',
    type: 'tag',
    tooltip: 'Famille de la donnée',
    tagCategory: 'Famille',
    tagMode: 'multiple',
  },
  classification_name: {
    attributeId: 'classification_name',
    label: "Axes d'analyse",
    type: 'tag',
    tooltip: "Axes d'analyse",
    tagMode: 'multiple',
    tagCategory: 'Classification'
  },
  type_name: {
    attributeId: 'type_name',
    label: "Type",
    type: 'tag',
    tooltip: "Type de la donnée",
    tagMode: 'simple',
    tagCategory: 'Type'
  },
  is_reference: {
    attributeId: 'is_reference',
    label: "Donnée référentielle",
    type: 'boolean',
    tooltip: "La donnée est-elle une donnée de référence ?",
  },
  origin_name: {
    attributeId: 'origin_name',
    label: "Origine de la donnée",
    type: 'tag',
    tooltip: "Origine de la donnée",
    tagMode: 'simple',
    tagCategory: 'Origine',
  },
  origin_application: {
    attributeId: 'origin_application',
    label: "Application d'origine",
    type: 'application',
    tooltip: "Application d'origine",
  },
  open_data_name: {
    attributeId: 'open_data_name',
    label: "Open data",
    type: 'tag',
    tooltip: "La donnée est-elle exposable en open data ?",
    tagMode: 'simple',
    tagCategory: 'OpenData',
  },
  exposition_name: {
    attributeId: 'exposition_name',
    label: "Exposition",
    type: 'tag',
    tooltip: "Exposition de la donnée",
    tagMode: 'simple',
    tagCategory: 'Exposition',
  },
  sensibility_name: {
    attributeId: 'sensibility_name',
    label: "Sensibilité",
    type: 'tag',
    tooltip: "Sensibilité de la donnée",
    tagMode: 'simple',
    tagCategory: 'Sensibilité',
  },
  tag_name: {
    attributeId: 'tag_name',
    label: "Tags",
    type: 'tag',
    tooltip: "Tags supplémentaires affectés à la donnée",
    tagMode: 'multiple',
    tagCategory: 'Tag',
  },
  volumetry: {
    attributeId: 'volumetry',
    label: "Volumétrie",
    type: 'text',
    tooltip: "Volumétrie de la donnée",
    hasSuffixValue: true,
    suffixAttributeId: 'volumetry_comment',
    suffixAttributeLabel: 'Commentaire sur la volumétrie',
  },
  monthly_volumetry: {
    attributeId: 'monthly_volumetry',
    label: "Production par mois",
    type: 'text',
    tooltip: "Production par mois de la donnée",
    hasSuffixValue: true,
    suffixAttributeId: 'monthly_volumetry_comment',
    suffixAttributeLabel: 'Commentaire sur la production par mois',
  },
  update_frequency_name: {
    attributeId: 'update_frequency_name',
    label: "Mise à jour",
    type: 'tag',
    tooltip: "Fréquence de mise à jour de la donnée",
    tagMode: 'simple',
  },
  conservation: {
    attributeId: 'conservation',
    label: "Durée de conservation",
    type: 'text',
    tooltip: "Durée de conservation de la donnée",
  },
  database_name: {
    attributeId: 'database_name',
    label: "Base / index",
    type: 'text',
    tooltip: "Base / index contenant la donnée",
  },
  database_table_name: {
    attributeId: 'database_table_name',
    label: "Table",
    type: 'text',
    tooltip: "Nom de la table contenant la donnée",
  },
  database_table_count: {
    attributeId: 'database_table_count',
    label: "Nombre de tables dans la base",
    type: 'text',
    inputType: 'number',
    tooltip: "Nombre de tables dans la base contenant la donnée",
  },
  field: {
    attributeId: 'field',
    label: "Champs",
    type: 'text',
    tooltip: "Noms des champs de la table contenant la donnée",
  },
  field_count: {
    attributeId: 'field_count',
    label: "Nombre de champs dans la table",
    type: 'text',
    inputType: 'number',
    tooltip: "Nombre de champs dans la table contenant la donnée",
  },
  application: {
    goals: {
      attributeId: 'application_goals',
      label: 'Finalité de l\'application',
      type: 'text',
      isTextArea: true,
      tooltip: 'Finalité de l\'application',
    },
    name: {
      attributeId: 'application_name',
      label: "Nom de l'application",
      type: 'text',
      tooltip: "Le nom de l'application hébergeant la donnée",
      headingLevel: 3,
      // hasSuffixValue: true,
      // suffixAttributeId: 'application_long_name',
    },
    organization_name: {
      attributeId: 'application_organization',
      label: 'Organisation',
      type: 'tag',
      tagMode: 'simple',
      tooltip: 'Organisation',
      // hasSuffixValue: true,
      // suffixAttributeId: 'organization_long_name',
    },
    context_email: {
      attributeId: 'application_context_email',
      label: 'Contact',
      type: 'text',
      tooltip: "Contact de l'application",
    },
    data_sources_count: {
      attributeId: 'data_sources_count',
      label: "Nombre de données décrites",
      type: 'text',
      inputType: 'number',
      readOnly: true,
      tooltip: "Nombre de sources de données décrites par l'application",
    },
    operator_count: {
      attributeId: 'application_operator_count',
      label: "Nombre d'opérateurs",
      type: 'text',
      inputType: 'number',
      tooltip: "Nombre d'opérateurs",
      hasSuffixValue: true,
      suffixAttributeId: 'operator_count_comment',
      suffixAttributeLabel: "Commentaire sur le nombre d'opérateurs",
    },
    user_count: {
      attributeId: 'application_user_count',
      label: "Nombre d'utilisateurs",
      type: 'text',
      inputType: 'number',
      tooltip: "Nombre d'utilisateurs",
      hasSuffixValue: true,
      suffixAttributeId: 'user_count_comment',
      suffixAttributeLabel: "Commentaire sur le nombre d'utilisateurs",
    },
    monthly_connection_count: {
      attributeId: 'application_monthly_connection_count',
      label: "Nombre de connexions mensuelles",
      type: 'text',
      inputType: 'number',
      tooltip: "Nombre de connexions mensuelles",
      hasSuffixValue: true,
      suffixAttributeId: 'monthly_connection_count_comment',
      suffixAttributeLabel: 'Commentaire sur le nombre de connexions mensuelles',
    },
    validation_date: {
      attributeId: 'application_validation_date',
      label: 'Date de validation',
      type: 'text',
      tooltip: 'Date de validation',
    },
    historic: {
      attributeId: 'application_historic',
      label: 'Historique',
      type: 'text',
      tooltip: "Historique",
    },
  },
};
