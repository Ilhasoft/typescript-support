/// <reference path="../typings/parse.d.ts" />
/// <reference path="../extensions/parse.ts" />

/*
* Before save message objects, add the field chatId for liveQuery
*/
function handleMessageBeforeSave(request: Parse.Cloud.BeforeSaveRequest, response: Parse.Cloud.BeforeSaveResponse, chatKey: string) {
    let message = request.object as Parse.Object;
    if (message.isNew()) {
        let chat = message.get(chatKey) as Parse.Object;
        message.set("chatId", chat.id);
        response.success(message);
    } else {
        response.success();
    }
}

/*
* After save message objects, add to the corresponding chat as the last message received
*/
function handleMessageAfterSave(request: Parse.Cloud.AfterSaveRequest, chatKey: string) {
    let message = request.object as Parse.Object
    if (message.isNew2()) {
        let chat = message.get(chatKey) as Parse.Object
        chat.set("lastMessage", message)
        chat.save();
    }
}
