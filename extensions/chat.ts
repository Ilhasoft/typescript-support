/// <reference path="../typings/parse.d.ts" />

/*
* Before save message objects, add the field chatId for liveQuery
*/
function handleMessageBeforeSave(request: Parse.Cloud.BeforeSaveRequest, response: Parse.Cloud.BeforeSaveResponse, chatKey: string, chatIdKey: string) {
    let message = request.object as Parse.Object;
    if (message.isNew()) {
        let chat = message.get(chatKey) as Parse.Object;
        message.set(chatIdKey, chat.id);
        response.success(message);
    } else {
        response.success();
    }
}