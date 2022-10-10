export default {
  name: {
    attributeId: 'name',
    label: 'Nom de la donnée',
    headingLevel: 3,
    type: 'text',
    tooltip: 'Libellé fonctionnel de la donnée',
    required: true
  },
  description: {
    attributeId: 'description',
    label: 'Description',
    type: 'text',
    isTextArea: true,
    tooltip: 'Description fonctionnelle de la donnée',
  },
  example: {
    attributeId: 'example',
    label: 'Exemple',
    type: 'text',
    isTextArea: true,
    tooltip: 'Exemple de donnée',
  },
  family_name: {
    attributeId: 'family_name',
    label: 'Familles',
    type: 'tag',
    tooltip: 'Famille fonctionnelle de la donnée',
    tagCategory: 'Famille',
    tagMode: 'multiple',
    tagColor: 'blue',
    tagDisplayMode: 'tag',
    required: true
  },
  classification_name: {
    attributeId: 'classification_name',
    label: "Axes d'analyse",
    type: 'tag',
    tooltip: "Types de référentiels utilisés pour classifier la donnée",
    tagMode: 'multiple',
    tagCategory: "Axes d'analyse",
    tagColor: 'purple',
    tagDisplayMode: 'tag',
  },
  type_name: {
    attributeId: 'type_name',
    label: "Type",
    type: 'tag',
    tooltip: "Type de la donnée",
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
    tooltip: "xxxxx",
  },
  origin_name: {
    attributeId: 'origin_name',
    label: "Origine",
    type: 'tag',
    tooltip: "Origine fonctionnelle de la donnée",
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
    tooltip: "Applications sources",
  },
  open_data_name: {
    attributeId: 'open_data_name',
    label: "Open Data",
    type: 'tag',
    tooltip: "La donnée est-elle publiable en Open Data ?",
    tagMode: 'simple',
    tagCategory: 'OpenData',
    tagColor: 'green',
    tagDisplayMode: 'tag',
  },
  exposition_name: {
    attributeId: 'exposition_name',
    label: "Exposition",
    type: 'tag',
    tooltip: "Type de mises à disposition",
    tagMode: 'multiple',
    tagCategory: 'Exposition',
    tagColor: 'gold',
    tagDisplayMode: 'tag',
  },
  sensibility_name: {
    attributeId: 'sensibility_name',
    label: "Sensibilité",
    type: 'tag',
    tooltip: "Sensibilité des données identifiantes",
    tagMode: 'simple',
    tagCategory: 'Sensibilité',
    tagColor: 'lime',
    tagDisplayMode: 'tag',
  },
  tag_name: {
    attributeId: 'tag_name',
    label: "Tags",
    type: 'tag',
    tooltip: "Tags de la donnée",
    tagMode: 'multiple',
    tagCategory: 'Tag',
    tagDisplayMode: 'tag',
  },
  volumetry: {
    attributeId: 'volumetry',
    label: "Volumétrie",
    type: 'text',
    tooltip: "Nombre de lignes ou d’objets unitaires exploités (images, fichiers, documents…)",
    hasSuffixValue: true,
    suffixAttributeId: 'volumetry_comment',
    suffixAttributeLabel: 'Commentaire sur la volumétrie',
  },
  monthly_volumetry: {
    attributeId: 'monthly_volumetry',
    label: "Production par mois",
    type: 'text',
    tooltip: "Nombre de lignes ou d’objets unitaires créés par mois",
    hasSuffixValue: true,
    suffixAttributeId: 'monthly_volumetry_comment',
    suffixAttributeLabel: 'Commentaire sur la production par mois',
  },
  update_frequency_name: {
    attributeId: 'update_frequency_name',
    label: "Fréquence de mises à jour",
    type: 'tag',
    tooltip: "Fréquence des mises à jour de la donnée",
    tagMode: 'simple',
    tagCategory: 'Mise à jour',
    tagDisplayMode: 'text'
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
    tooltip: "Nom de la base ou index",
  },
  database_table_name: {
    attributeId: 'database_table_name',
    label: "Tables",
    type: 'text',
    tooltip: "Nom de la table",
  },
  database_table_count: {
    attributeId: 'database_table_count',
    label: "Nombre de tables dans la base",
    type: 'text',
    inputType: 'number',
    tooltip: "Nombre de tables dans la base contenant la donnée",
  },
  fields: {
    attributeId: 'fields',
    label: "Champs",
    type: 'text',
    tooltip: "Noms des champs dans la table",
  },
  field_count: {
    attributeId: 'field_count',
    label: "Nombre de champs dans la table",
    type: 'text',
    inputType: 'number',
    tooltip: "Nombre de champs dans la table",
  },
  application: {
    goals: {
      attributeId: 'application_goals',
      label: 'Finalité de l\'application',
      type: 'text',
      isTextArea: true,
      tooltip: 'Finalité de l\'application',
      required: true,
      textEditDisabledIfApplicationNotSelected: true
    },
    name: {
      attributeId: 'application_name',
      label: "Nom de l'application",
      type: 'text',
      tooltip: "Libellé fonctionnel de l'application",
      headingLevel: 3,
      required: true
      // hasSuffixValue: true,
      // suffixAttributeId: 'application_long_name',
    },
    long_name: {
      attributeId: 'application_long_name',
      label: "Nom détaillé de l'application",
      type: 'text',
      tooltip: "Libellé détaillé de l'application",
      headingLevel: 5,
    },
    access_url: {
      attributeId: 'access_url',
      label: 'Site',
      type: 'text',
      isLink: true,
      tooltip: 'xxxx'
    },
    organization_name: {
      attributeId: 'application_organization',
      label: 'Organisation',
      type: 'tag',
      tagMode: 'simple',
      tooltip: 'MOA propriétaire de l\'application',
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
      // Only used for tooltips
    },
    context_email: {
      attributeId: 'application_context_email',
      label: 'Contact',
      type: 'text',
      tooltip: "Contact du gestionnaire de la donnée",
      isMail: true
    },
    data_source_count: {
      attributeId: 'data_source_count',
      label: "Nombre de données décrites",
      type: 'text',
      inputType: 'number',
      readOnly: true,
      tooltip: "xxxxx",
    },
    operator_count: {
      attributeId: 'application_operator_count',
      label: "Nombre d'opérateurs",
      type: 'text',
      inputType: 'number',
      tooltip: "Nombre d’opérateurs de l’application (saisie, maj des données)",
      hasSuffixValue: true,
      suffixAttributeId: 'operator_count_comment',
      suffixAttributeLabel: "Commentaire sur le nombre d'opérateurs",
    },
    user_count: {
      attributeId: 'application_user_count',
      label: "Nombre d'utilisateurs",
      type: 'text',
      inputType: 'number',
      tooltip: "Nombre d’utilisateurs de l’application en consultation",
      hasSuffixValue: true,
      suffixAttributeId: 'user_count_comment',
      suffixAttributeLabel: "Commentaire sur le nombre d'utilisateurs",
    },
    monthly_connection_count: {
      attributeId: 'application_monthly_connection_count',
      label: "Nombre de connexions mensuelles",
      type: 'text',
      inputType: 'number',
      tooltip: "Nombre de connexions d’utilisateurs uniques de l’application par mois",
      hasSuffixValue: true,
      suffixAttributeId: 'monthly_connection_count_comment',
      suffixAttributeLabel: 'Commentaire sur le nombre de connexions mensuelles',
    },
    historic: {
      attributeId: 'application_historic',
      label: 'Historique',
      type: 'text',
      inputType: 'number',
      tooltip: "Année création des données les plus anciennes",
    },
    validation_date: {
      attributeId: 'application_validation_date',
      label: 'Date de validation',
      type: 'text',
      tooltip: 'Validité de la présente cartographie pour publication',
    },
    references: {
      attributeId: 'references',
      label: 'Références',
      tooltip: 'xxxx',
      readOnly: true,
      tagMode: 'multiple',
      tagColor: 'blue',
      type: 'tag'
    }
  },
};
