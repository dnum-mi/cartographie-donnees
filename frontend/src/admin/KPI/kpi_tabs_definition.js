const tabs_definition = [
    {
        label: "Fiche donnée",
        id: "datasource_count_visits",
        rowKey:"subpath",
        columns: [
            {
                title: 'Fiche donnée',
                dataIndex: 'subpath',
                key: 'datasource_kpi_id',
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
        rowKey:"pathname",
        columns: [
            {
                title: 'Type de page',
                dataIndex: 'pathname',
                key: 'path_kpi_type',
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
        rowKey:0,
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
        rowKey:0,
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