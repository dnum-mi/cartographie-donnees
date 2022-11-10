import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import { Menu } from 'antd';
import './AdminPage.css';
import ApplicationsRouter from "./applications/ApplicationsRouter";
import DataSourcesRouter from "./data-sources/DataSourcesRouter";
import EnumerationsRouter from "./enumerations/EnumerationsRouter";
import UsersRouter from "./users/UsersRouter";
import SettingsRouter from "./settings/SettingsRouter";
import {countApplication, countDataSource, countUser} from '../api';

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
        countApplication().then((response)=> {
            this.setState({application_count: response.data});
        })
        countDataSource().then((response)=> {
            this.setState({data_source_count: response.data});
        })
        if (this.props.user.is_admin === true) {
            countUser().then((response)=> {
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
                    <ApplicationsRouter user={this.props.user} count={this.get_count} />
                </Route>
                <Route
                    key="data-sources"
                    path={this.props.match.url + '/data-sources'}
                >
                    <DataSourcesRouter user={this.props.user} count={this.get_count} />
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
                    <UsersRouter count={this.get_count} />
                </Route>
                )}
                {this.props.user.is_admin && (
                <Route
                    key="settings"
                    path={this.props.match.url + '/settings'}
                >
                    <SettingsRouter updateHomepage = {this.props.updateHomepage} homepageContent= {this.props.homepageContent}/>
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
                        pertinentes: Nom de la donnée, Description, Familles, Axes d'analyse, Type, Référentiel,
                        Sensibilité, Open data, Exposition, Origine, Nom de l’application, Nom long de l'application,
                        Organisation, Nom long de l'organisation, Finalités de l’application, Tags.
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
                        Les administrateurs peuvent être entièrement importées par un administrateur général depuis le bouton
                        "import" de la page administration des administrateurs. Pour importer les administrateurs, il faut
                        s'assurer qu'aucune donnée et qu'aucune application ne soit encore présente. Pour cela,
                        il est conseillé d'importer un fichier de données ne contenant que les en-têtes puis un fichier
                        d'application ne contenant que les en-têtes. Les données et applications seront supprimées.
                        Les administrateurs seront tous supprimés avant d’importer les nouveaux administrateurs.
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
                            Les info-bulles sont rangées dans des listes déroulantes par type de champ qu'elles décrivent.</li>
                    </ul>
                    <p>
                        Les paramètres peuvent être entièrement importés par un administrateur général depuis le bouton
                        "import" de la page administration des paramètres. Chaque paramètre est stocké en base de données
                        avec un identifiant composé d'une catégorie et d'une clé prédéfinie.
                        Pour conserver les paramètres et leur identifiant associé, il est conseillé de sauvegarder préalablement
                        les paramètres de l'outil via le bouton "export" car l'ensemble des paramètres sera écrasé lors de l’import.
                        La liste des paramètres étant fixe, si des paramètres ne sont pas importés,
                        ils pourront toujours être modifiés plus tard via le bouton "Modifier les paramètres".
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
                        <li>Vider les données (il est conseillé d'importer un fichier de données ne contenant que les en-têtes)</li>
                        <li>Vider les applications (il est conseillé d'importer un fichier d'application ne contenant que les en-têtes) </li>
                        <li>Importer les administrateurs</li>
                        <li>Importer les filtres</li>
                        <li>Importer les applications</li>
                        <li>Importer les données</li>
                    </ol>
                    <p>
                        Les paramètres sont indépendants des autres données de l'outil et ne sont donc pas affectés par ces procédures.
                        Ils peuvent donc être complètements modifiés/importés séparément.
                    </p>
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
