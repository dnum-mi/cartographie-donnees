import errors from './errors.json'

export function createError(error) {
    let message = error.response.data.description;
    if (message instanceof Array) {
        message = message[0];
    }
    for (const key in errors) {
        if (message.includes(key)) {
            return errors[key];
        }
    }
    return message;
}
