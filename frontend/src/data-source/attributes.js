export default {
  name: {
    attributeId: 'name',
    label: 'Nom de la donnée',
    headingLevel: 3,
    type: 'text',
    required: true
  },
  description: {
    attributeId: 'description',
    label: 'Description',
    type: 'text',
    isTextArea: true,
  },
  example: {
    attributeId: 'example',
    label: 'Exemple',
    type: 'text',
    isTextArea: true,
  },
  family_name: {
    attributeId: 'family_name',
    label: 'Familles',
    type: 'tag',
    tagCategory: 'Famille',
    tagMode: 'multiple',
    tagColor: 'blue',
    tagDisplayMode: 'tag',
    required: true
  },
  analysis_axis_name: {
    attributeId: 'analysis_axis_name',
    label: "Axes d'analyse",
    type: 'tag',
    tagMode: 'multiple',
    tagCategory: "Axes d'analyse",
    tagColor: 'purple',
    tagDisplayMode: 'tag',
  },
  type_name: {
    attributeId: 'type_name',
    label: "Type",
    type: 'tag',
    tagMode: 'simple',
    tagCategory: 'Type',
    tagColor: 'red',
    tagDisplayMode: 'tag',
    required: true
  },
  is_reference: {
    attributeId: 'is_reference',
    label: "Donnée référentielle",
    type: 'boolean',
  },
  origin_name: {
    attributeId: 'origin_name',
    label: "Origine",
    type: 'tag',
    tagMode: 'simple',
    tagCategory: 'Origine',
    tagColor: 'geekblue',
    tagDisplayMode: 'tag',
  },
  origin_applications: {
    attributeId: 'origin_applications',
    label: "Applications sources",
    type: 'application',
    applicationMode: 'multiple',
    applicationLimited: false
  },
  open_data_name: {
    attributeId: 'open_data_name',
    label: "Open Data",
    type: 'tag',
    tagMode: 'simple',
    tagCategory: 'OpenData',
    tagColor: 'green',
    tagDisplayMode: 'tag',
  },
  exposition_name: {
    attributeId: 'exposition_name',
    label: "Exposition",
    type: 'tag',
    tagMode: 'multiple',
    tagCategory: 'Exposition',
    tagColor: 'gold',
    tagDisplayMode: 'tag',
  },
  sensibility_name: {
    attributeId: 'sensibility_name',
    label: "Sensibilité",
    type: 'tag',
    tagMode: 'simple',
    tagCategory: 'Sensibilité',
    tagColor: 'lime',
    tagDisplayMode: 'tag',
  },
  tag_name: {
    attributeId: 'tag_name',
    label: "Tags",
    type: 'tag',
    tagMode: 'multiple',
    tagCategory: 'Tag',
    tagDisplayMode: 'tag',
  },
  volumetry: {
    attributeId: 'volumetry',
    label: "Volumétrie",
    type: 'text',
    inputType: 'number',
    hasSuffixValue: true,
    suffixAttributeId: 'volumetry_comment',
    suffixAttributeLabel: 'Commentaire sur la volumétrie',
  },
  monthly_volumetry: {
    attributeId: 'monthly_volumetry',
    label: "Production par mois",
    type: 'text',
    inputType: 'number',
    hasSuffixValue: true,
    suffixAttributeId: 'monthly_volumetry_comment',
    suffixAttributeLabel: 'Commentaire sur la production par mois',
  },
  update_frequency_name: {
    attributeId: 'update_frequency_name',
    label: "Fréquence de mises à jour",
    type: 'tag',
    tagMode: 'simple',
    tagCategory: 'Mise à jour',
    tagDisplayMode: 'text'
  },
  conservation: {
    attributeId: 'conservation',
    label: "Durée de conservation",
    type: 'text',
  },
  database_name: {
    attributeId: 'database_name',
    label: "Base / index",
    type: 'text',
  },
  database_table_name: {
    attributeId: 'database_table_name',
    label: "Tables",
    type: 'text',
  },
  database_table_count: {
    attributeId: 'database_table_count',
    label: "Nombre de tables dans la base",
    type: 'text',
    inputType: 'number',
  },
  fields: {
    attributeId: 'fields',
    label: "Champs",
    type: 'text',
  },
  field_count: {
    attributeId: 'field_count',
    label: "Nombre de champs dans la table",
    type: 'text',
    inputType: 'number',
  },
  application: {
    goals: {
      attributeId: 'application_goals',
      label: 'Finalité de l\'application',
      type: 'text',
      isTextArea: true,
      required: true,
      textEditDisabledIfApplicationNotSelected: true
    },
    name: {
      attributeId: 'application_name',
      label: "Nom de l'application",
      type: 'text',
      headingLevel: 3,
      required: true
      // hasSuffixValue: true,
      // suffixAttributeId: 'application_long_name',
    },
    long_name: {
      attributeId: 'application_long_name',
      label: "Nom détaillé de l'application",
      type: 'text',
      headingLevel: 5,
    },
    access_url: {
      attributeId: 'access_url',
      label: 'Site',
      type: 'text',
      isLink: true,
    },
    organization_name: {
      attributeId: 'application_organization',
      label: 'Organisation',
      type: 'tag',
      tagMode: 'simple',
      tagCategory: 'Organisation',
      tagColor: 'volcano',
      tagDisplayMode: 'tag',
      required: true
      // hasSuffixValue: true,
      // suffixAttributeId: 'organization_long_name',
    },
    organization_long_name: {
      attributeId: 'organization_long_name',
      readOnly: true,
    },
    context_email: {
      attributeId: 'application_context_email',
      label: 'Contact',
      type: 'text',
      isMail: true
    },
    data_source_count: {
      attributeId: 'data_source_count',
      label: "Nombre de données décrites",
      type: 'text',
      inputType: 'number',
      readOnly: true,
    },
    operator_count: {
      attributeId: 'application_operator_count',
      label: "Nombre d'opérateurs",
      type: 'text',
      inputType: 'number',
      hasSuffixValue: true,
      suffixAttributeId: 'operator_count_comment',
      suffixAttributeLabel: "Commentaire sur le nombre d'opérateurs",
    },
    user_count: {
      attributeId: 'application_user_count',
      label: "Nombre d'utilisateurs",
      type: 'text',
      inputType: 'number',
      hasSuffixValue: true,
      suffixAttributeId: 'user_count_comment',
      suffixAttributeLabel: "Commentaire sur le nombre d'utilisateurs",
    },
    monthly_connection_count: {
      attributeId: 'application_monthly_connection_count',
      label: "Nombre de connexions mensuelles",
      type: 'text',
      inputType: 'number',
      hasSuffixValue: true,
      suffixAttributeId: 'monthly_connection_count_comment',
      suffixAttributeLabel: 'Commentaire sur le nombre de connexions mensuelles',
    },
    historic: {
      attributeId: 'application_historic',
      label: 'Historique',
      type: 'text',
      inputType: 'number',
    },
    validation_date: {
      attributeId: 'application_validation_date',
      label: 'Date de validation',
      type: 'date',
    }
  },
};
