interface String {

    formatRegExp: RegExp;

    format: (...args: string[]) => string;

}

// Reference: http://www.codeproject.com/Tips/201899/String-Format-in-JavaScript
String.prototype.formatRegExp = new RegExp("{-?[0-9]+}", "g");
String.prototype.format = function (...args: string[]): string {
    var str: string = this;
    return str.replace(String.prototype.formatRegExp, function (item): string {
        var intVal = parseInt(item.substring(1, item.length - 1));
        if (intVal >= 0) {
            return args[intVal];
        } else if (intVal === -1) {
            return "{";
        } else if (intVal === -2) {
            return "}";
        } else {
            return "";
        }
    });
};