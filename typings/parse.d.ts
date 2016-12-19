/*
 * Type definitions for Parse v1.9.2
 * Project: http://parseplatform.github.io/
 * Write by: Daniel San Ferreira da Rocha <danielsan@ilhasoft.com.br>
 * Definitions by: Ilhasoft <http://ilhasoft.com.br>
 * Created on 15/12/16.
 */

/**
 * @namespace
 * Contains all Parse API classes and functions.
 */
declare namespace Parse {

    var applicationId: string;
    var javaScriptKey: string;
    var masterKey: string;
    var serverURL: string;
    var VERSION: string;

    interface SuccessOption {
        success?: () => void;
    }

    interface ErrorOption {
        error?: (error: Error) => void;
    }

    interface SuccessFailureOptions extends SuccessOption, ErrorOption { }

    interface SessionTokenOption {

        /**
         * A valid session token, used for making a request on behalf of a specific user. 
         */
        sessionToken?: string;

    }

    interface UseMasterKeyOption {

        /**
         * In Cloud Code and Node only, causes the Master Key to be used for this request.
         */
        useMasterKey?: boolean;

    }

    interface ScopeOptions extends SessionTokenOption, UseMasterKeyOption {
    }

    /**
     * Call this method first to set up your authentication tokens for Parse.
     * You can get your keys from the Data Browser on parse-server.
     * @param {string} applicationId Your Parse Application ID.
     * @param {string} javaScriptKey (optional) Your Parse JavaScript Key (Not needed for parse-server).
     * @param {string} masterKey (optional) Your Parse Master Key.
     */
    function initialize(applicationId: string, javaScriptKey?: string, masterKey?: string): void;

    interface IBaseObject {
        /**
         * @returns A JSON-encoded version of this object.
         */
        toJSON(): any;
    }

    class BaseObject implements IBaseObject {
        toJSON(): any;
    }

    /**
     * Creates a new ACL.
     * If no argument is given, the ACL has no permissions for anyone.
     * If the argument is a Parse.User, the ACL will have read and write
     *   permission for only that user.
     * If the argument is any other JSON object, that object will be interpretted
     *   as a serialized ACL created with toJSON().
     * @see Parse.Object#setACL
     * @class
     *
     * <p>An ACL, or Access Control List can be added to any
     * <code>Parse.Object</code> to restrict access to only a subset of users
     * of your application.</p>
     */
    class ACL extends BaseObject {

        permissionsById: any;

        constructor(arg1?: any);

        /**
         * Returns whether this ACL is equal to another object
         * @param {ACL} other The other object to compare to.
         */
        equals(other: ACL): boolean;

        /**
         * Gets whether the public is allowed to read this object.
         */
        getPublicReadAccess(): boolean;

        /**
         * Gets whether the public is allowed to write this object.
         */
        getPublicWriteAccess(): boolean;

        /**
         * Get whether the given user id is explicitly allowed to read this object.
         * Even if this returns false, the user may still be able to access it if
         *   getPublicReadAccess returns true or a role that the user belongs to
         *   has write access.
         * @param {User|string|Role} userId An instance of Parse.User or its objectId,
         *   or a Parse.Role.
         */
        getReadAccess(userId: User | string | Role): boolean;

        /**
         * Gets whether users belonging to the given role are allowed to read this object.
         * Even if this returns false, the role may still be able to write it if a parent
         *   role has read access.
         * @param {string|Role} role The name of the role, or a Parse.Role object.
         * @returns true if the role has read access. false otherwise.
         */
        getRoleReadAccess(role: string | Role): boolean;

        /**
         * Gets whether users belonging to the given role are allowed to write this object.
         * Even if this returns false, the role may still be able to write it if a parent
         *   role has write access.
         * @param {string|Role} role The name of the role, or a Parse.Role object.
         * @returns true if the role has write access. false otherwise.
         */
        getRoleWriteAccess(role: string | Role): boolean;

        /**
         * Gets whether the given user id is explicitly allowed to write this object.
         * Even if this returns false, the user may still be able to write it if
         *   getPublicWriteAccess returns true or a role that the user belongs to
         *   has write access.
         * @param {User|string|Role} userId An instance of Parse.User or its objectId,
         *   or a Parse.Role.
         */
        getWriteAccess(userId: User | string | Role): boolean;

        /**
         * Sets whether the public is allowed to read this object.
         */
        setPublicReadAccess(allowed: boolean): void;

        /**
         * Sets whether the public is allowed to write this object.
         */
        setPublicWriteAccess(allowed: boolean): void;

        /**
         * Sets whether the given user is allowed to read this object.
         * @param {User|string} userId An instance of Parse.User or its objectId.
         * @param {boolean} allowed Whether that user should have read access.
         */
        setReadAccess(userId: User | string, allowed: boolean): void;

        /**
         * Sets whether users belonging to the given role are allowed to read this object.
         * @param {string|Role} role The name of the role, or a Parse.Role object.
         * @param {boolean} allowed Whether the given role can read this object.
         */
        setRoleReadAccess(role: string | Role, allowed: boolean): void;

        /**
         * Sets whether users belonging to the given role are allowed to write this object.
         * @param {string|Role} role The name of the role, or a Parse.Role object.
         * @param {boolean} allowed Whether the given role can write this object.
         */
        setRoleWriteAccess(role: string | Role, allowed: boolean): void;

        /**
         * Sets whether the given user id is allowed to write this object.
         * @param {User|string|Role} userId An instance of Parse.User or its objectId,
         *   or a Parse.Role.
         * @param {boolean} allowed Whether that user should have write access.
         */
        setWriteAccess(userId: User, allowed: boolean): void;

    }

    /**
     * @namespace
     * Parse.Analytics provides an interface to Parse's logging and analytics backend.
     */
    namespace Analytics {

        /**
         * Tracks the occurrence of a custom event with additional dimensions.
         *   Parse will store a data point at the time of invocation with the
         *   given event name.
         * Dimensions will allow segmentation of the occurrences of this custom
         *   event. Keys and values should be {@code String}s, and will throw otherwise.
         * To track a user signup along with additional metadata, consider the following:
         * 
         * var dimensions = {
         *  gender: 'm',
         *  source: 'web',
         *  dayType: 'weekend'
         * };
         * Parse.Analytics.track('signup', dimensions);
         * 
         * There is a default limit of 8 dimensions per event tracked.
         * 
         * @param {string} name The name of the custom event to report to Parse as having happened.
         * @param {any} dimensions The dictionary of information by which to segment this event.
         * @returns A promise that is resolved when the round-trip to the server completes.
         */
        function track<T>(name: string, dimensions: any): Promise<T>;

    }

    /**
     * @namespace
     */
    namespace Cloud {

        interface BaseRequest {

            /**
             * If set, the installationId triggering the request.
             */
            installationId?: string;

            /**
             * If true, means the master key was used
             */
            master?: boolean;

            /**
             * If set, the user that made the request.
             */
            user?: User;

        }

        interface TriggerRequest extends BaseRequest {

            object: Object;

        }

        interface TriggerResponse {

            success(): void;

            /**
             * If called, will reject the save.
             * @param {string} response An optional error message may be passed in.
             */
            error(response?: string): void;

        }

        interface AfterDeleteRequest extends BaseRequest { }

        interface AfterSaveRequest extends BaseRequest { }

        interface BeforeDeleteRequest extends BaseRequest { }

        interface BeforeDeleteResponse extends TriggerResponse { }

        interface BeforeSaveRequest extends BaseRequest { }

        interface BeforeSaveResponse extends TriggerResponse {

            /**
             * If called, will allow the save to happen.
             * @param {Object} object The passed in object will be saved instead.
             */
            success(object?: Object): void;

        }

        interface Cookie {

            name?: string;

            options?: CookieOptions;

            value?: string;

        }

        interface CookieOptions {

            domain?: string;

            expires?: Date;

            httpOnly?: boolean;

            maxAge?: number;

            path?: string;

            secure?: boolean;

        }

        interface FunctionRequest extends BaseRequest {

            /**
             * The params passed to the cloud function
             */
            params?: { [headerName: string]: string | number | boolean };

        }

        interface FunctionResponse extends TriggerResponse {

            /**
             * If success is called, will return a successful response.
             * @param {any} value The optional argument to the caller.
             */
            success(value?: any): void;

        }

        interface HTTPOptions extends FunctionResponse {

            /**
             * The body of the request.
             * If it is a JSON object, then the Content-Type set in the headers must be application/x-www-form-urlencoded or application/json.
             * You can also set this to a Buffer object to send raw bytes.
             * If you use a Buffer, you should also set the Content-Type header explicitly to describe what these bytes represent.
             */
            body?: string | Object;

            /**
             * Defaults to 'false'.
             */
            followRedirects?: boolean;

            /**
             * The headers for the request.
             */
            headers?: {
                [headerName: string]: string | number | boolean;
            };

            /**
             *The method of the request (i.e GET, POST, etc).
             */
            method?: string;

            /**
             * The query portion of the url.
             */
            params?: any;

            /**
             * The url to send the request to.
             */
            url: string;

        }

        interface HttpResponse {

            // buffer?: Buffer;

            cookies?: any;

            data?: any;

            headers?: any;

            status?: number;

            text?: string;

        }

        interface JobRequest {

            /**
             * The params passed to the background job
             */
            params?: { [headerName: string]: string | number | boolean };

        }

        interface JobStatus {

            error(response?: any): void;

            message(response?: any): void;

            success(response?: any): void;

        }

        function afterDelete(arg1: string | User, func: (request: AfterDeleteRequest) => void): void;

        function afterSave(arg1: string | User, func: (request: AfterSaveRequest) => void): void;

        function beforeDelete(arg1: string | User, func: (request: BeforeDeleteRequest, response: BeforeDeleteResponse) => void): void;

        function beforeSave(arg1: string | User, func: (request: BeforeSaveRequest, response: BeforeSaveResponse) => void): void;

        function define(name: string, func: (request: FunctionRequest, response: FunctionResponse) => void): void;

        function httpRequest(options: HTTPOptions): Promise<HttpResponse>;

        function job(name: string, func: (request: JobRequest, status: JobStatus) => void): HttpResponse;

        function run<T>(name: string, data?: { [param: string]: string | number | boolean | Date }): Promise<T>;

        function useMasterKey(): void;

    }

    class Config {

        static current(): Config;

        static get(): Promise<Config>;

        escape(attr: string): any;

        get(attr: string): any;

    }

    /*
     * We need to inline the codes in order to make compilation work without this type definition as dependency.
     */
    const enum ErrorCode {

        OTHER_CAUSE = -1,
        INTERNAL_SERVER_ERROR = 1,
        CONNECTION_FAILED = 100,
        OBJECT_NOT_FOUND = 101,
        INVALID_QUERY = 102,
        INVALID_CLASS_NAME = 103,
        MISSING_OBJECT_ID = 104,
        INVALID_KEY_NAME = 105,
        INVALID_POINTER = 106,
        INVALID_JSON = 107,
        COMMAND_UNAVAILABLE = 108,
        NOT_INITIALIZED = 109,
        INCORRECT_TYPE = 111,
        INVALID_CHANNEL_NAME = 112,
        PUSH_MISCONFIGURED = 115,
        OBJECT_TOO_LARGE = 116,
        OPERATION_FORBIDDEN = 119,
        CACHE_MISS = 120,
        INVALID_NESTED_KEY = 121,
        INVALID_FILE_NAME = 122,
        INVALID_ACL = 123,
        TIMEOUT = 124,
        INVALID_EMAIL_ADDRESS = 125,
        MISSING_CONTENT_TYPE = 126,
        MISSING_CONTENT_LENGTH = 127,
        INVALID_CONTENT_LENGTH = 128,
        FILE_TOO_LARGE = 129,
        FILE_SAVE_ERROR = 130,
        DUPLICATE_VALUE = 137,
        INVALID_ROLE_NAME = 139,
        EXCEEDED_QUOTA = 140,
        SCRIPT_FAILED = 141,
        VALIDATION_ERROR = 142,
        INVALID_IMAGE_DATA = 150,
        UNSAVED_FILE_ERROR = 151,
        INVALID_PUSH_TIME_ERROR = 152,
        FILE_DELETE_ERROR = 153,
        REQUEST_LIMIT_EXCEEDED = 155,
        INVALID_EVENT_NAME = 160,
        USERNAME_MISSING = 200,
        PASSWORD_MISSING = 201,
        USERNAME_TAKEN = 202,
        EMAIL_TAKEN = 203,
        EMAIL_MISSING = 204,
        EMAIL_NOT_FOUND = 205,
        SESSION_MISSING = 206,
        MUST_CREATE_USER_THROUGH_SIGNUP = 207,
        ACCOUNT_ALREADY_LINKED = 208,
        INVALID_SESSION_TOKEN = 209,
        LINKED_ID_MISSING = 250,
        INVALID_LINKED_SESSION = 251,
        UNSUPPORTED_SERVICE = 252,
        AGGREGATE_ERROR = 600,
        FILE_READ_ERROR = 601,
        X_DOMAIN_REQUEST = 602
    }

    class Error {

        code: ErrorCode;

        message: string;

        constructor(code: ErrorCode, message: string);

    }

    /**
     * @namespace
     * Provides a set of utilities for using Parse with Facebook.
     */
    namespace FacebookUtils {

        function init(options?: any): void;

        function isLinked(user: User): boolean;

        function link(user: User, permissions: any, options?: SuccessFailureOptions): void;

        function logIn(permissions: any, options?: SuccessFailureOptions): void;

        function unlink(user: User, options?: SuccessFailureOptions): void;

    }

    /**
     * A Parse.File is a local representation of a file that is saved to the Parse
     * cloud.
     * @class
     * @param name {string} The file's name. This will be prefixed by a unique
     *     value once the file has finished saving. The file name must begin with
     *     an alphanumeric character, and consist of alphanumeric characters,
     *     periods, spaces, underscores, or dashes.
     * @param data {Array} The data for the file, as either:
     *     1. an Array of byte value Numbers, or
     *     2. an Object like { base64: "..." } with a base64-encoded String.
     *     3. a File object selected with a file upload control. (3) only works
     *        in Firefox 3.6+, Safari 6.0.2+, Chrome 7+, and IE 10+.
     *        For example:<pre>
     * var fileUploadControl = $("#profilePhotoFileUpload")[0];
     * if (fileUploadControl.files.length > 0) {
     *   var file = fileUploadControl.files[0];
     *   var name = "photo.jpg";
     *   var parseFile = new Parse.File(name, file);
     *   parseFile.save().then(function() {
     *     // The file has been saved to Parse.
     *   }, function(error) {
     *     // The file either could not be read, or could not be saved to Parse.
     *   });
     * }</pre>
     * @param type {string} Optional Content-Type header to use for the file. If
     *     this is omitted, the content type will be inferred from the name's
     *     extension.
     */
    class File {

        constructor(name: string, data: any, type?: string);

        name(): string;

        url(): string;

        save<T>(): Promise<T>;

    }

    /**
     * Creates a new GeoPoint with any of the following forms:<br>
     *   <pre>
     *   new GeoPoint(otherGeoPoint)
     *   new GeoPoint(30, 30)
     *   new GeoPoint([30, 30])
     *   new GeoPoint({latitude: 30, longitude: 30})
     *   new GeoPoint()  // defaults to (0, 0)
     *   </pre>
     * @class
     *
     * <p>Represents a latitude / longitude point that may be associated
     * with a key in a ParseObject or used as a reference point for geo queries.
     * This allows proximity-based queries on the key.</p>
     *
     * <p>Only one key in a class may contain a GeoPoint.</p>
     *
     * <p>Example:<pre>
     *   var point = new Parse.GeoPoint(30.0, -20.0);
     *   var object = new Parse.Object("PlaceObject");
     *   object.set("location", point);
     *   object.save();</pre></p>
     */
    class GeoPoint extends BaseObject {

        latitude: number;

        longitude: number;

        constructor(arg1?: any, arg2?: any);

        current(options?: SuccessFailureOptions): GeoPoint;

        kilometersTo(point: GeoPoint): number;

        milesTo(point: GeoPoint): number;

        radiansTo(point: GeoPoint): number;

    }

    class Installation extends Object { }

    /**
     * Creates a new model with defined attributes. A client id (cid) is
     * automatically generated and assigned for you.
     *
     * <p>You won't normally call this method directly.  It is recommended that
     * you use a subclass of <code>Parse.Object</code> instead, created by calling
     * <code>extend</code>.</p>
     *
     * <p>However, if you don't want to use a subclass, or aren't sure which
     * subclass is appropriate, you can use this form:<pre>
     *     var object = new Parse.Object("ClassName");
     * </pre>
     * That is basically equivalent to:<pre>
     *     var MyClass = Parse.Object.extend("ClassName");
     *     var object = new MyClass();
     * </pre></p>
     *
     * @param {Object} attributes The initial set of data to store in the object.
     * @param {Object} options A set of Backbone-like options for creating the
     *     object.  The only option currently supported is "collection".
     * @see Parse.Object.extend
     *
     * @class
     *
     * <p>The fundamental unit of Parse data, which implements the Backbone Model
     * interface.</p>
     */
    class Object extends BaseObject {

        id: string;

        createdAt: Date;

        updatedAt: Date;

        attributes: any;

        cid: string;

        changed: boolean;

        className: string;

        constructor(className?: string, options?: any);

        constructor(attributes?: string[], options?: any);

        static createWithoutData<T extends Object>(id: string): T;

        static destroyAll<T>(list: Object[]): Promise<T>;

        static disableSingleInstance(): void;

        static enableSingleInstance(): void;

        static extend(className: string, protoProps?: any, classProps?: any): any;

        static fetchAll<T>(list: Object[]): Promise<T>;

        static fetchAllIfNeeded<T>(list: Object[]): Promise<T>;

        static fromJSON(json: string): Object;

        static saveAll<T extends Object>(list: T[]): Promise<T[]>;

        static registerSubclass<T extends Object>(className: string, clazz: new (options?: any) => T): void;

        initialize(): void;

        add(attr: string, item: any): Object;

        addUnique(attr: string, item: any): void;

        clear(options: any): void;

        clone(): Object;

        destroy<T>(options?: ScopeOptions): Promise<T>;

        dirty(attr: string): boolean;

        dirtyKeys(): string[];

        equals(): boolean;

        escape(attr: string): string;

        existed(): boolean;

        fetch<T extends Object>(options?: ScopeOptions): Promise<T>;

        get(attr: string): string | number | boolean | Date | Object | User;

        getACL(): ACL;

        has(attr: string): boolean;

        increment(attr: string, amount?: number): void;

        isNew(): boolean;

        isValid(): boolean;

        op(attr: string): Op;

        relation<T extends Object>(attr: string): Relation<T>;

        remove(attr: string, item: string | number | boolean | Object | Date): void;

        save<T extends Object>(attrs?: { [key: string]: string | number | boolean | Object | Date }, options?: ScopeOptions): Promise<T>;

        save<T extends Object>(key: string, value: string | number | boolean | Object | Date, options?: ScopeOptions): Promise<T>;

        set(key: string, value: string | number | boolean | Object | Date, options?: ErrorOption): boolean;

        setACL(acl: ACL, options?: SuccessFailureOptions): boolean;

        unset(attr: string): void;

        validate(attrs: any): boolean;

    }

    /**
     * @class
     * A Parse.Op is an atomic operation that can be applied to a field in a
     * Parse.Object. For example, calling <code>object.set("foo", "bar")</code>
     * is an example of a Parse.Op.Set. Calling <code>object.unset("foo")</code>
     * is a Parse.Op.Unset. These operations are stored in a Parse.Object and
     * sent to the server as part of <code>object.save()</code> operations.
     * Instances of Parse.Op should be immutable.
     *
     * You should not create subclasses of Parse.Op or instantiate Parse.Op
     * directly.
     */
    interface Op extends IBaseObject { }

    namespace Op {

        interface BaseOperation extends Op {

            objects(): any[]

        }

        interface Add extends BaseOperation { }

        interface AddUnique extends BaseOperation { }

        interface Increment extends IBaseObject {

            amount(): number;

        }

        interface Relation extends Op {

            added(): Object[];

            removed(): Object[];

        }

        interface Remove extends BaseOperation { }

        interface Set extends Op {
            value(): any;
        }

        interface Unset extends Op { }

    }

    /**
     * A Promise is returned by async methods as a hook to provide callbacks to be
     * called when the async task is fulfilled.
     *
     * <p>Typical usage would be like:<pre>
     *    query.find().then(function(results) {
     *      results[0].set("foo", "bar");
     *      return results[0].saveAsync();
     *    }).then(function(result) {
     *      console.log("Updated " + result.id);
     *    });
     * </pre></p>
     *
     * @see Parse.Promise.prototype.then
     * @class
     */

    interface IPromise<T> {

        then<U>(resolvedCallback: (...values: T[]) => IPromise<U>, rejectedCallback?: (reason: any) => IPromise<U>): IPromise<U>;

        then<U>(resolvedCallback: (...values: T[]) => U, rejectedCallback?: (reason: any) => IPromise<U>): IPromise<U>;

        then<U>(resolvedCallback: (...values: T[]) => U, rejectedCallback?: (reason: any) => U): IPromise<U>;

    }

    class Promise<T> implements IPromise<T> {

        static as<U>(resolvedValue: U): Promise<U>;

        static error<U, V>(error: U): Promise<V>;

        static is(possiblePromise: any): Boolean;

        static when(promises: IPromise<any>[]): Promise<any>;

        static when(...promises: IPromise<any>[]): Promise<any>;

        always(callback: Function): Promise<T>;

        done(callback: Function): Promise<T>;

        fail(callback: Function): Promise<T>;

        reject(error: any): void;

        resolve(result: any): void;

        then<U>(resolvedCallback: (...values: T[]) => IPromise<U>, rejectedCallback?: (reason: any) => IPromise<U>): IPromise<U>;

        then<U>(resolvedCallback: (...values: T[]) => U, rejectedCallback?: (reason: any) => IPromise<U>): IPromise<U>;

        then<U>(resolvedCallback: (...values: T[]) => U, rejectedCallback?: (reason: any) => U): IPromise<U>;

    }

    /**
     * Contains functions to deal with Push in Parse
     * @name Parse.Push
     * @namespace
     */
    class Push {

        send<T>(data: PushData, options?: SendOptions): Promise<T>;

    }

    interface PushData {

        channels?: string[];

        push_time?: Date;

        expiration_time?: Date;

        expiration_interval?: number;

        where?: Query<Parse.Installation>;

        data?: any;

        alert?: string;

        badge?: string;

        sound?: string;

        title?: string;

    }

    interface SendOptions extends UseMasterKeyOption, SuccessFailureOptions { }

    /**
     * Creates a new parse Parse.Query for the given Parse.Object subclass.
     * @param objectClass -
     *   An instance of a subclass of Parse.Object, or a Parse className string.
     * @class
     *
     * <p>Parse.Query defines a query that is used to fetch Parse.Objects. The
     * most common use case is finding all objects that match a query through the
     * <code>find</code> method. For example, this sample code fetches all objects
     * of class <code>MyClass</code>. It calls a different function depending on
     * whether the fetch succeeded or not.
     *
     * <pre>
     * var query = new Parse.Query(MyClass);
     * query.find({
     *   success: function(results) {
     *     // results is an array of Parse.Object.
     *   },
     *
     *   error: function(error) {
     *     // error is an instance of Parse.Error.
     *   }
     * });</pre></p>
     *
     * <p>A Parse.Query can also be used to retrieve a single object whose id is
     * known, through the get method. For example, this sample code fetches an
     * object of class <code>MyClass</code> and id <code>myId</code>. It calls a
     * different function depending on whether the fetch succeeded or not.
     *
     * <pre>
     * var query = new Parse.Query(MyClass);
     * query.get(myId, {
     *   success: function(object) {
     *     // object is an instance of Parse.Object.
     *   },
     *
     *   error: function(object, error) {
     *     // error is an instance of Parse.Error.
     *   }
     * });</pre></p>
     *
     * <p>A Parse.Query can also be used to count the number of objects that match
     * the query without retrieving all of those objects. For example, this
     * sample code counts the number of objects of the class <code>MyClass</code>
     * <pre>
     * var query = new Parse.Query(MyClass);
     * query.count({
     *   success: function(number) {
     *     // There are number instances of MyClass.
     *   },
     *
     *   error: function(error) {
     *     // error is an instance of Parse.Error.
     *   }
     * });</pre></p>
     */
    class Query<T> extends BaseObject {

        objectClass: any;

        className: string;

        constructor(objectClass: any);

        static or<T>(...var_args: Query<T>[]): Query<T>;

        addAscending(key: string | string[]): Query<T>;
        addDescending(key: string | string[]): Query<T>;
        ascending(key: string | string[]): Query<T>;
        containedIn(key: string, values: any[]): Query<T>;
        contains(key: string, substring: string): Query<T>;
        containsAll(key: string, values: any[]): Query<T>;
        count<T>(options?: ScopeOptions): Promise<T>;
        descending(key: string | string[]): Query<T>;
        doesNotExist(key: string): Query<T>;
        doesNotMatchKeyInQuery(key: string, queryKey: string, query: Query<Object>): Query<T>;
        doesNotMatchQuery(key: string, query: Query<Object>): Query<T>;
        each<T>(callback: Function, options?: ScopeOptions): Promise<T>;
        endsWith(key: string, suffix: string): Query<T>;
        equalTo(key: string, value: any): Query<T>;
        exists(key: string): Query<T>;
        find<T extends Object>(options?: ScopeOptions): Promise<T[]>;
        first<T>(options?: ScopeOptions): Promise<T>;
        get(objectId: string, options?: ScopeOptions): Promise<any>;
        greaterThan(key: string, value: any): Query<T>;
        greaterThanOrEqualTo(key: string, value: any): Query<T>;
        include(key: string | string[]): Query<T>;
        lessThan(key: string, value: any): Query<T>;
        lessThanOrEqualTo(key: string, value: any): Query<T>;
        limit(n: number): Query<T>;
        matches(key: string, regex: RegExp, modifiers: any): Query<T>;
        matchesKeyInQuery(key: string, queryKey: string, query: Query<Object>): Query<T>;
        matchesQuery(key: string, query: Query<Object>): Query<T>;
        near(key: string, point: GeoPoint): Query<T>;
        notContainedIn(key: string, values: any[]): Query<T>;
        notEqualTo(key: string, value: any): Query<T>;
        select(...keys: string[]): Query<T>;
        skip(n: number): Query<T>;
        startsWith(key: string, prefix: string): Query<T>;
        withinGeoBox(key: string, southwest: GeoPoint, northeast: GeoPoint): Query<T>;
        withinKilometers(key: string, point: GeoPoint, maxDistance: number): Query<T>;
        withinMiles(key: string, point: GeoPoint, maxDistance: number): Query<T>;
        withinRadians(key: string, point: GeoPoint, maxDistance: number): Query<T>;
    }

    /**
     * A class that is used to access all of the children of a many-to-many relationship.
     * Each instance of Parse.Relation is associated with a particular parent object and key.
     */
    class Relation<T extends Object> extends BaseObject {

        parent: Object;

        key: string;

        targetClassName: string;

        constructor(parent?: Object, key?: string);

        /**
         * Adds a Parse.Object or an array of Parse.Objects to the relation.
         */
        add(object: T): void;

        /**
         *  Returns a Parse.Query that is limited to objects in this relation.
         */
        query(): Query<T>;

        /**
         * Removes a Parse.Object or an array of Parse.Objects from this relation.
         */
        remove(object: T): void;

    }

    /**
     * Represents a Role on the Parse server. Roles represent groupings of
     * Users for the purposes of granting permissions (e.g. specifying an ACL
     * for an Object). Roles are specified by their sets of child users and
     * child roles, all of which are granted any permissions that the parent
     * role has.
     *
     * <p>Roles must have a name (which cannot be changed after creation of the
     * role), and must specify an ACL.</p>
     * @class
     * A Parse.Role is a local representation of a role persisted to the Parse
     * cloud.
     */
    class Role extends Object {

        constructor(name: string, acl: ACL);

        getRoles(): Relation<Role>;

        getUsers(): Relation<User>;

        getName(): string;

        setName(name: string, options?: SuccessFailureOptions): any;

    }

    class Session extends Object {

        static current(): Promise<Session>;

        getSessionToken(): string;

        isCurrentSessionRevocable(): boolean;

    }

    /**
     * @class
     *
     * <p>A Parse.User object is a local representation of a user persisted to the
     * Parse cloud. This class is a subclass of a Parse.Object, and retains the
     * same functionality of a Parse.Object, but also extends it with various
     * user specific methods, like authentication, signing up, and validation of
     * uniqueness.</p>
     */
    class User extends Object {

        static allowCustomUserClass(isAllowed: boolean): void;

        static become<T>(sessionToken: string): Promise<T>;

        static current(): User;

        static currentAsync(): Promise<User>;

        static disableUnsafeCurrentUser(): void;

        static enableRevocableSession(): void;

        static enableUnsafeCurrentUser(): void;

        static extend(protoProps?: any, classProps?: any): any;

        static logIn<T>(username: string, password: string): Promise<T>;

        static logOut<T>(): Promise<T>;

        static signUp<T>(username: string, password: string, attrs?: { [headerName: string]: string | number | boolean | Object | Date }): Promise<T>;

        static signUp<T>(attrs: { [headerName: string]: string | number | boolean | Object | Date }, options?: SuccessFailureOptions): Promise<T>;

        static requestPasswordReset<T>(email: string, options?: SuccessFailureOptions): Promise<T>;

        authenticated(): boolean;

        getEmail(): string;

        getSessionToken(): string;

        getUsername(): string;

        isCurrent(): boolean;

        logIn<T>(): Promise<T>;

        setEmail(email: string, options: SuccessFailureOptions): boolean;

        setPassword(password: string, options?: SuccessFailureOptions): boolean;

        setUsername(username: string, options?: SuccessFailureOptions): boolean;

    }

}
