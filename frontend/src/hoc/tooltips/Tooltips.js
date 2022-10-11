import defaultTooltips from "./defaultTooltips"
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
        this.tooltips = { ...this.tooltips, ...(_.pick(newTooltips, _.keys(this.tooltips))) }
    }

}
