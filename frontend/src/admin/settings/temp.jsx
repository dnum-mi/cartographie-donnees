componentDidMount() {
    this.fetchHomepageFromApi();
  }

fetchHomepageFromApi = () => {
this.setState({
    loading: true,
    error: null,
});
fetchWildCards("homepage")
    .then((response) => {
    this.setState({
        homepage_data: response.data,
        loading: false,
        error: null,
    });
    })
    .catch((error) => {
    this.setState({
        loading: false,
        error,
    });
    });
};


export = () => {
    exportModel(exportWildCardsUrl, 'Parametres.csv');
}
