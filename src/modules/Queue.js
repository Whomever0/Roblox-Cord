const { 
    v4: uuid
} = require('uuid');

class Queue {
    constructor(client){
        this.list = [];
        this.client = client;
    }

    addToList(command){
        if (!(command instanceof QueuedCommand)) return;

        this.list.push(command);
    }

    serializeQueue(){
        return JSON.stringify(this.list.map(x => `${x.caller.tag}|${x.uid}|${x.name}|${x.args.join('>>``>>`')}`));
    }

    handleReturn(parsed){
        if (parsed.UID === undefined) return "Failed"; // invalid response.

        var command = this.list.filter(x => x.uid === parsed.UID).shift();

        if (command === undefined) return "Failed"; // invalid response.

        this.list.splice(this.list.indexOf(command));

        if (parsed.Code === '0') { // success!            
            command.channel.messages.fetch(command.message_id)
                .then(message => message.reply(`Success!`));
            
            return "Success";
        };

        if (parsed.Code === '1') { // code error
            command.channel.messages.fetch(command.message_id)
                .then(message => message.reply(`Error!\n\`${parsed.Message}\``));
            
            return "Success";
        }

        if (parsed.Code === '2') { // internal error
            command.channel.messages.fetch(command.message_id)
                .then(message => message.reply(`Interal script error!\nRoblox returned: \`${parsed.Message}\``));
            
            return "Success";
        }
    }

}

class QueuedCommand {
    constructor(name, args, caller, channel, message_id){
        this.caller = caller;
        this.name = name;
        this.args = args;
        this.channel = channel;
        this.message_id = message_id;
        this.uid = uuid();
    }
}

module.exports = {
    "Queue": Queue,
    "QueuedCommand": QueuedCommand
};