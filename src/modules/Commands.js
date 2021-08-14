class Command {
    constructor(name, description, args){
        if (typeof args !== "object") return;
        this.name = name;
        this.description = description;
        this.args = args;
    }
}

const Commands = [
    new Command("print", "Prints a message to every Roblox server.", {
        "...": "string"
    }),
    new Command("kill-player", "Kills a player in-game", {
        "user-id": "number"
    })
]

module.exports = Commands;