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

function sendPushToOthersExceptId(userId: string, pushData: any): Parse.Promise<any> {
    const user = new Parse.User();
    user.id = userId;
    return sendPushToOthersExcept(user, pushData);
}

function sendPushToOthersExcept(user: Parse.User, pushData: any): Parse.Promise<any> {
    return sendPushWhere(new Parse.Query(Parse.Installation).notEqualTo("user", user), pushData);
}

function sendPushToUserId(userId: string, pushData: any): Parse.Promise<any> {
    const user = new Parse.User();
    user.id = userId;
    return sendPushToUser(user, pushData);
}

function sendPushToUser(user: Parse.User, pushData: any): Parse.Promise<any> {
    return sendPushWhere(new Parse.Query(Parse.Installation).equalTo("user", user), pushData);
}

/**
 Send push to users removing the sending user
*/
function sendPushToUsers(users: [Parse.User], me: Parse.User, pushData: any) {
    var query = new Parse.Query(Parse.Installation);
    query.containedIn("user", users);
    query.notEqualTo("user", me);
    return sendPushWhere(query, pushData);
}

function sendPushWhere(pushQuery: Parse.Query<Parse.Installation>, pushData: any): Parse.Promise<any> {
    pushQuery.notEqualTo("enabled", false);
    return Parse.Push.send({
        where: pushQuery,
        data: pushData
    }, {
        useMasterKey: true
    });
}

// Reference: http://stackoverflow.com/questions/18835190/extend-basic-types-in-typescript-error-this-is-not-defined
Parse.Object.prototype.isNew2 = function (): boolean {
    const obj: Parse.Object = this;
    return (obj.updatedAt.getTime() === obj.createdAt.getTime());
}
