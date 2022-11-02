import errors from './errors.json'

export function createError(error) {
    for (const key in errors) {
        if (error.response.data.description.includes(key)) {
            return errors[key];
        }
    }
    return error.response.data.description;
}
