import default_user from "./defaultUser"
const _ = require("lodash")

export default class User {
    constructor(user) {
        this.user = _.cloneDeep(default_user)
        this.user = { ...this.user, ...user }
    }

    userIsAdmin = () => {
        return this.user.is_admin
    }

    userHasAdminRightsToDatasource = (dataSource) => {
        return this.user && (this.userIsAdmin() || this.userOwnsDataSource(dataSource))
    }
    userOwnsDataSource = (dataSource) => {
        return dataSource &&
            dataSource.application &&
            this.user.applications
                .map((app) => app.id)
                .indexOf(dataSource.application.id) > -1;
    }
}
