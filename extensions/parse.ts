/// <reference path="../typings/parse.d.ts" />

declare namespace Parse {

    interface Object {

        /**
         * Method that should be used in the afterSave trigger (from the cloud code)
         *   to know if the object was saved now.
         * @returns true if this object has never been saved to Parse.
         */
        isNew2: () => boolean;

    }

}

// Reference: http://stackoverflow.com/questions/18835190/extend-basic-types-in-typescript-error-this-is-not-defined
Parse.Object.prototype.isNew2 = function (): boolean {
    const obj: Parse.Object = this;
    return (obj.updatedAt.getTime() === obj.createdAt.getTime());
}
