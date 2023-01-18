export const admin_kpi_definition = [
    {
        title: "Effectif",
        children: [
            {
                key: "avg_datasources_per_application",
                label: "Nombre moyen de données par application",
                show_app_percent: false
            }]
    },
    {
        title: "Référentiels",
        children: [
            {
                key: "avg_referentiels_per_application",
                label: "Nombre moyen de référentiels utilisés par application",
                show_app_percent: false
            },
            {
                key: "count_applications_with_referentiels",
                label: "Nombre d'applications avec au moins un référentiel",
                show_app_percent: true
            }]
    },
    {
        title: "Réutilisations",
        children: [
            {
                key: "avg_reutilizations_per_application",
                label: "Nombre moyen de réutilisations par application",
                show_app_percent: false
            },
            {
                key: "count_applications_with_reutilizations",
                label: "Nombre d'applications avec au moins une réutilisation",
                show_app_percent: true
            }]
    },
    {
        title: "Niveau de description",
        children: [
            {
                key: "avg_datasource_description_level",
                label: "Niveau moyen de description sur l’ensemble des données",
                show_app_percent: false,
                is_percent: true
            },
            {
                key: "avg_application_description_level",
                label: "Niveau moyen de description par application",
                show_app_percent: false,
                is_percent: true

            }]
    }
]

const pathname_to_french = {
    "search": "Recherche",
    "data-source": "Fiche donnée",
    "admin": "Administration",
    "login": "Connexion"
}

const tabs_definition = [
    {
        label: "Fiche donnée",
        id: "datasource_count_visits",
        rowKey: "subpath",
        columns: [
            {
                title: 'Fiche donnée (application)',
                key: 'datasource_kpi_id',
                render: (_, record) => (
                    <p>{record.data_source_name} ({record.application_name})</p>
                ),
            },
            {
                title: 'Nombre de visites',
                dataIndex: 'count',
                key: 'datasource_kpi_count',
            },
        ]
    },
    {
        label: "Type de page",
        id: "path_count_visits",
        rowKey: "pathname",
        columns: [
            {
                title: 'Type de page',
                key: 'path_kpi_type',
                render: (_, record) => (
                    <p>{pathname_to_french[record.pathname]}</p>
                ),
            },
            {
                title: 'Nombre de visites',
                dataIndex: 'count',
                key: 'path_kpi_count',
            },
        ]
    },
    {
        label: "Filtre",
        id: "filters_queries",
        rowKey: 0,
        columns: [
            {
                title: 'Filtre',
                dataIndex: 0,
                key: 'filters_kpi_id',
            },
            {
                title: 'Nombre de recherches',
                dataIndex: 1,
                key: 'filters_kpi_count',
            },
        ]
    },
    {
        label: "Terme de recherche",
        id: "text_queries",
        rowKey: 0,
        columns: [
            {
                title: 'Terme de recherche',
                dataIndex: 0,
                key: 'text_kpi_id',
            },
            {
                title: 'Nombre de recherches',
                dataIndex: 1,
                key: 'text_kpi_count',
            },
        ]
    },
]


export default tabs_definition