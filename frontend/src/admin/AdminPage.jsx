import React from 'react';
import {withRouter, Switch, Route} from 'react-router-dom';
import {Menu} from 'antd';
import './AdminPage.css';
import ApplicationsRouter from "./applications/ApplicationsRouter";
import DataSourcesRouter from "./data-sources/DataSourcesRouter";
import EnumerationsRouter from "./enumerations/EnumerationsRouter";
import UsersRouter from "./users/UsersRouter";
import SettingsRouter from "./settings/SettingsRouter";
import {countApplication, countDataSource, countUser} from '../api';
import KPIPage from "./KPI/KpiPage";

class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            application_count: 0,
            data_source_count: 0,
            user_count: 0,
        }
    }

    componentDidMount() {
        this.get_count();
    }

    handleClick = (e) => {
        this.props.history.push(this.props.match.url + '/' + e.key);
    }

    currentPage = () => {
        const pathWithoutPrefix = this.props.location.pathname.replace('/admin/', '');
        return pathWithoutPrefix.split('/')[0];
    }

    get_count = () => {
        countApplication().then((response) => {
            this.setState({application_count: response.data});
        })
        countDataSource().then((response) => {
            this.setState({data_source_count: response.data});
        })
        if (this.props.user.is_admin === true) {
            countUser().then((response) => {
                this.setState({user_count: response.data});
            })
        }

    }

    renderMenu() {
        return (
            <Menu
                onClick={this.handleClick}
                defaultSelectedKeys={[this.currentPage()]}
            >
                <Menu.Item key="applications">
                    Applications ({this.state.application_count})
                </Menu.Item>
                <Menu.Item key="data-sources">
                    Données ({this.state.data_source_count})
                </Menu.Item>
                {this.props.user.is_admin && (
                    <Menu.Item key="enumerations">
                        Filtres
                    </Menu.Item>
                )}
                {this.props.user.is_admin && (
                    <Menu.Item key="users">
                        Administrateurs ({this.state.user_count})
                    </Menu.Item>
                )}
                {this.props.user.is_admin && (
                    <Menu.Item key="settings">
                        Paramètres
                    </Menu.Item>
                )}
                {this.props.user.is_admin && (
                    <Menu.Item key="kpi">
                        Indicateurs
                    </Menu.Item>
                )}

            </Menu>
        );
    }

    renderSwitch() {
        return (
            <Switch>
                <Route
                    key="applications"
                    path={this.props.match.url + '/applications'}
                >
                    <ApplicationsRouter user={this.props.user} count={this.get_count}/>
                </Route>
                <Route
                    key="data-sources"
                    path={this.props.match.url + '/data-sources'}
                >
                    <DataSourcesRouter user={this.props.user} count={this.get_count}/>
                </Route>
                {this.props.user.is_admin && (
                    <Route
                        key="enumerations"
                        path={this.props.match.url + '/enumerations'}
                    >
                        <EnumerationsRouter/>
                    </Route>
                )}
                {this.props.user.is_admin && (
                    <Route
                        key="users"
                        path={this.props.match.url + '/users'}
                    >
                        <UsersRouter count={this.get_count}/>
                    </Route>
                )}
                {this.props.user.is_admin && (
                    <Route
                        key="settings"
                        path={this.props.match.url + '/settings'}
                    >
                        <SettingsRouter
                            updateHomepage={this.props.updateHomepage}
                            homepageContent={this.props.homepageContent}
                            synonymsContent={this.props.synonymsContent}
                        />
                    </Route>
                )}
                {this.props.user.is_admin && (
                    <Route
                        key="kpi"
                        path={this.props.match.url + '/kpi'}
                    >
                        <KPIPage
                            application_count={this.state.application_count}
                        />
                    </Route>
                )}

                <Route
                    key="root"
                    path={this.props.match.url}
                    exact
                >
                    <h1>
                        Espace d'administration
                    </h1>

                    <h3>
                        Fonctionnement du moteur de recherche
                    </h3>
                    <p>
                        Le moteur de recherche combine les mots clés renseignés dans la barre de recherche aux filtres
                        sélectionnés. Les résultats de la recherche doivent contenir les mots renseignés et correspondre
                        aux filtres sélectionnés, c’est donc un ‘et’ logique qui est appliqué lors de la recherche.
                    </p>
                    <p>
                        Le moteur de recherche prend en compte les attributs suivants pour déterminer les données
                        pertinentes : Nom de la donnée, Description, Familles, Axes d'analyse, Type, Nom de l’application,
                        Nom long de l'application, Organisation, Nom long de l'organisation, Finalités de l’application,
                        Tags.
                    </p>

                    <h3>
                        Importer des données
                    </h3>
                    <p>
                        Les données peuvent être entièrement importées par un administrateur général depuis le bouton "import"
                        de la page administration des données. Il est conseillé de sauvegarder préalablement les données
                        de l'outil via le bouton "export" car l'ensemble des données sera écrasé lors de l’import.
                    </p>

                    <h3>
                        Importer des applications
                    </h3>
                    <p>
                        Les applications peuvent être entièrement importées par un administrateur général depuis le bouton
                        "import" de la page administration des applications. Pour importer les applications, il faut
                        préalablement vider l’ensemble des données de l’outil. Pour cela, il est conseillé d'importer
                        un fichier de données ne contenant que les en-têtes.
                    </p>
                    <p>
                        Il est conseillé de sauvegarder préalablement les applications de l'outil via le bouton "export"
                        car l'ensemble des applications sera écrasé lors de l’import.
                    </p>

                    <h3>
                        Importer des filtres
                    </h3>
                    <p>
                        Les filtres peuvent être entièrement importés par un administrateur général depuis le bouton "import"
                        de la page administration des filtres. Pour importer les filtres, il faut préalablement vider
                        les données et applications de l’outil. Pour cela, il est conseillé d'importer un fichier de
                        données ne contenant que les en-têtes puis un fichier d'application ne contenant que les
                        en-têtes. Il est conseillé de sauvegarder préalablement les filtres de l'outil via le bouton
                        "export" car l'ensemble des filtres sera écrasé lors de l’import.
                    </p>

                    <h3>
                        Importer des administrateurs
                    </h3>
                    <p>
                        Les administrateurs peuvent être entièrement importées par un administrateur général depuis le
                        bouton
                        "import" de la page administration des administrateurs. Pour importer les administrateurs, il
                        faut
                        s'assurer qu'aucune donnée et qu'aucune application ne soit encore présente. Pour cela,
                        il est conseillé d'importer un fichier de données ne contenant que les en-têtes puis un fichier
                        d'application ne contenant que les en-têtes. Les administrateurs seront tous supprimés avant
                        d’importer les nouveaux administrateurs.
                    </p>

                    <h3>
                        Paramètres
                    </h3>
                    <p>
                        La page "Paramètres" est séparée en deux sections:
                    </p>
                    <ul>
                        <li> La section "Page d'accueil" permet de modifier le texte affiché sur la page d'accueil.</li>
                        <li> La section "Info-bulles" permet de modifier les info-bulles présentes dans l'outil.
                            Les info-bulles sont rangées dans des listes déroulantes par type de champ qu'elles
                            décrivent.
                        </li>
                    </ul>
                    <p>
                        Les paramètres peuvent être entièrement importés par un administrateur général depuis le bouton
                        "import" de la page administration des paramètres.
                        Chaque paramètre est stocké en base de données avec un identifiant composé d'une catégorie
                        "Namespace" et d'une clé prédéfinie.
                        Pour conserver les paramètres et leur identifiant associé, il est conseillé de sauvegarder
                        préalablement les paramètres de l'outil via le bouton "export ", car l'ensemble des paramètres
                        sera écrasé lors de l’import.
                        La colonne "Libellé" du fichier exporté est uniquement présente à titre indicatif et ne permet
                        pas de modifier les libellés des paramètres via l'import.
                        Si des paramètres ne sont pas importés, ils pourront toujours être modifiés plus tard via le
                        bouton "Modifier les paramètres".
                    </p>


                    <h3>
                        Réimporter la base de données
                    </h3>
                    <p>
                        Avant de réimporter la base, il faut assurer que l’ensemble des données de l'outil a bien été
                        sauvegardé via le bouton "export" pour éviter toute perte de données. En effet, lors de
                        l'import, l’ensemble de la base sera supprimé.
                    </p>
                    <p>
                        Pour réimporter la base, il faut suivre les étapes suivantes dans l'ordre :
                    </p>
                    <ol>
                        <li>Vider les données (il est conseillé d'importer un fichier de données ne contenant que les
                            en-têtes)
                        </li>
                        <li>Vider les applications (il est conseillé d'importer un fichier d'application ne contenant
                            que les en-têtes)
                        </li>
                        <li>Importer les administrateurs</li>
                        <li>Importer les filtres</li>
                        <li>Importer les applications</li>
                        <li>Importer les données</li>
                    </ol>
                    <p>
                        Les paramètres sont indépendants des autres données de l'outil et ne sont donc pas affectés par
                        ces procédures.
                        Ils peuvent donc être complètements modifiés/importés séparément.
                    </p>
                    <h3>
                        Identification des doublons dans l'import
                    </h3>
                    <p>
                        A l'import des applications et des données, des doublons peuvent être identifiés.
                        Si c'est le cas, les données seront tout de même importées, l'administrateur général sera averti
                        et il pourra modifier manuellement les données importées si besoin.
                    </p>
                    <p>
                        Deux applications sont considérées en doublons si leurs noms sont sémantiquement proches. Deux
                        données sont considérées en doublon si elles appartiennent à une même application et que leurs
                        noms sont sémantiquement proches.
                    </p>
                    <p>
                        Deux noms sont considérés sémantiquement proches s'ils sont similaires à plus de 95%.
                        Ce ratio est calculé en fonction du nombre de sous-parties présents dans les deux chaînes
                        de caractères. Par exemple, les noms "Empreintes génétiques" et "Empreintes digitales"
                        ont ratio de similarité de 73% et ne sont donc pas considérés comme proches.
                    </p>
                    <h3>
                        Propriétés calculées des applications
                    </h3>
                    <p>
                        Certaines propriétés, visibles à l'export des applications, sont calculées à partir d'autres
                        informations de la base de données. Voici la liste des règles de calcul utilisées pour ces
                        champs.
                    </p>
                    <ul>
                        <li>
                            <b>Nombre de données</b> : nombre de données qui sont dans le périmètre de cette
                            application.
                        </li>
                        <li>
                            <b>Nombre de référentiels utilisés</b> : nombre de données étant indiquées comme
                            "Données référentielles" dans le périmètre de l'application.
                        </li>
                        <li>
                            <b>Nombre de réutilisations</b> : nombre d'applications réutilisant des données qui sont
                            dans le périmètre de l'application.
                        </li>
                        <li>
                            <b>Niveau de description de l'application</b> : moyenne pour chaque application des données
                            décrites du remplissage des 24 champs suivants :
                            <ul>
                                <li>
                                    19 champs "donnée" : Nom, Description, Application, Famille, Type, Exemple, Sensibilité,
                                    OpenData, Base/index, Table, Nb tables, Champ, Nb champs, Volumétrie, Production par mois,
                                    Mise à jour, Conservation, Exposition, Origine (sont exclus les champs : Réutilisation,
                                    Tag, Commentaire sur la volumétrie, Commentaire sur la  production par mois, Axes d'analyse,
                                    Application source, Donnée référentielle)
                                </li>
                                <li>
                                    5 champs "application" : Contact, Nombre d'opérateurs, Nombre d'utilisateurs,
                                    Nombre de connexions mensuelles, Historique.
                                </li>
                            </ul>
                        </li>
                    </ul>


                    <h3>
                        Indicateurs de l'outil
                    </h3>

                    <h4>Indicateurs pour l'administration</h4>
                    <ul>
                        <li>
                            Nombre moyen de données par application
                        </li>
                        <li>
                            Nombre moyen de référentiels utilisés par application
                        </li>
                        <li>
                            Nombre d'applications avec au moins un référentiel
                        </li>
                        <li>
                            Nombre moyen de réutilisations par application
                        </li>
                        <li>
                            Nombre d'applications avec au moins une réutilisation
                        </li>
                        <li>
                            Niveau moyen de description sur l’ensemble des données
                        </li>
                        <li>
                            Niveau moyen de description par application (Uniquement pour les applications contenant
                            des données
                        </li>
                    </ul>

                    <h4>Indicateurs de fréquentation</h4>
                    <p>
                        Les indicateurs de fréquentation sont calculés sur une période de temps à définir (par défaut 1
                        an passé)
                        et suivant les règles décrites ci-dessous:
                    </p>
                    <ul>
                        <li>
                            <b>Fiche donnée</b> : Les 50 fiches données les plus visitées.
                        </li>
                        <li>
                            <b>Type de page</b> : Le nombre de visite par type de page (Recherche, Fiche donnée,
                            Administration, Connexion). Les pages sont classées en fonction de la première partie de
                            leur chemin d'accès: /search, /data-source, /admin, /login. Les visites de pages
                            inexistantes sont également comptabilisé si la première partie du chemin d'accès est
                            connue. Par exemple "/data-source/xxxx" sera compté comme une visite à une
                            page de type fiche donnée même cette donnée n'existe pas mais "/xxxx" ne sera pas
                            compté comme une visite de page.
                        </li>
                        <li>
                            <b>Filtre</b> : Les 50 filtres de recherche les plus utilisées.
                        </li>
                        <li>
                            <b>Terme de recherche</b> : Les 50 termes de recherche les plus utilisées. Les termes
                            utilisés pour cet indicateur correspondent aux termes après traitement du langage par
                            l'algorithme de recherche ("Véhicules" apparait comme "vehicule" par exemple).
                        </li>
                    </ul>

                    <h3>
                        Documentation de l'API
                    </h3>
                    <p>
                        La documentation de l'API est disponible
                        via <a href="/docs" target="_blank">ce lien.</a>
                    </p>
                </Route>
            </Switch>
        );
    }

    render() {
        return (
            <div className="AdminPage container">
                <div className="Menu">
                    {this.renderMenu()}
                </div>
                <div className="Switch">
                    {this.renderSwitch()}
                </div>
            </div>
        );
    }
}

export default withRouter(AdminPage);
