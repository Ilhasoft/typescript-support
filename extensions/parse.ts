// Reference: http://stackoverflow.com/questions/18835190/extend-basic-types-in-typescript-error-this-is-not-defined

declare namespace Parse {

    interface Object {

        isNew2: () => boolean;

    }

}

Parse.Object.prototype.isNew2 = function (): boolean {
    const obj: Parse.Object = this;
    return obj.isNew() || (obj.updatedAt.getTime() === obj.createdAt.getTime());
}
