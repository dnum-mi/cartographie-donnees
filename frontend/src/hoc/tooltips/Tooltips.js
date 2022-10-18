import defaultTooltips from "./tooltipsConstants"
const _ = require('lodash');

export default class Tooltips {
    constructor(arg_tooltips) {
        this.tooltips = _.cloneDeep(defaultTooltips)
        this.tooltips = {
            ...this.tooltips,
            ...(_.pick(arg_tooltips, _.keys(this.tooltips))) // Only update existing keys
        }
    }

    get = (elementId) => {
        return this.tooltips[elementId] || ""
    }

    update = (newTooltips) => {
        // Enrich old tooltips with new values or overwrite old ones
        this.tooltips = { ...this.tooltips, ...(_.pick(newTooltips, _.keys(this.tooltips))) }
    }

    refresh = (newTooltips) => {
        // replace whole old tooltips with new tooltips
        let temp_tooltips = _.cloneDeep(defaultTooltips)
        temp_tooltips = {
            ...temp_tooltips,
            ...(_.pick(newTooltips, _.keys(temp_tooltips))) // Only update existing keys
        }
        this.tooltips = {...this.tooltips, ...temp_tooltips}
    }


}
