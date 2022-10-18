import defaultTooltips from "./tooltipsConstants"
const _ = require('lodash');

export default class Tooltips {
    constructor(arg_tooltips, arg_refresh_wildcards) {
        this.tooltips = _.cloneDeep(defaultTooltips)
        this.tooltips = {
            ...this.tooltips,
            ...(_.pick(arg_tooltips, _.keys(this.tooltips))) // Only update existing keys
        }
        this.refreshWildcards = arg_refresh_wildcards
    }

    get = (elementId) => {
        return this.tooltips[elementId] || ""
    }
}
