// I'm not amazing at JS and I don't know best practices, please don't judge! Do tell me how to improve this though.

class Command {
    constructor(name, description, args){
        if (typeof args !== "object") return;
        this.name = name;
        this.description = description;
        this.args = args;
    }
}

function checkType(input, desiredType){
    if (desiredType === "string") return true;
    if (desiredType === "boolean") return input.toLowerCase() === "true" || input.toLowerCase() === "false";
    if (desiredType === "number") return parseFloat(input).toString() !== 'NaN';
}

function compareStrings(str1, str2){
    return (str1.toLowerCase() === str2.toLowerCase());
}

const Commands = [
    new Command("print", "Prints a message to every Roblox server.", {
        "...": "string"
    })
]

class Parser {

    isCommand(commandName){
        if (typeof commandName !== "string") return false;

        return Commands.filter(e => compareStrings(e.name, commandName)).length > 0;
    }

    getCommand(commandName){
        if (typeof commandName !== "string") return false;

        return Commands.filter(e => compareStrings(e.name, commandName)).shift();
    }

    getArguments(commandString){
        var allArgs = String(commandString).split(' ');
        
        if (allArgs.length < 1) return;

        return allArgs;
    }

    typeCheckArguments(commandName, argList){
        if (!this.isCommand(commandName)) return false;
        var command = this.getCommand(commandName);

        if (argList.length < command.args.length) return false;

        var index = -1;
        var filtered = Object.keys(command.args).filter((a) => {
            index++;
            return checkType(argList[index], command.args[a])
        })

        return filtered.length === Object.keys(command.args).length;
    }

}

module.exports = {
    "Parser": Parser,
    "Commands": Commands
};