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
        "player-identifier": "string"
    }),
    new Command("loadstring", "Executes arbitrary code in-game!", {
        "code": "string"
    }),
    new Command("van", "Don't question it.", {
        "player-identifier": "string"
    }),
    new Command('disco', "Dance party!", {
        "player-identifier": "string"
    })
]

module.exports = Commands;