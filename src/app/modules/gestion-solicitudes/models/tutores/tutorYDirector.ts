export class TutorYDirector {
    static nuevoTutorYDirector(obj: Object) {
        return new TutorYDirector(obj['id'], obj['codigoTutor'], obj['nombreTutor']);
    }

    constructor(public id: string, public codigoTutor: string, public nombreTutor: string) {}
}
