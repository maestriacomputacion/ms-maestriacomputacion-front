export class AuthToken {
    static nuevoAuthToken(obj: Object) {
        return new AuthToken(obj['token']);
    }

    constructor(public token: string) {}
}
