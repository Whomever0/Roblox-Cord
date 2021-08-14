const Discord = require('discord.js');
const express = require("express");
const fs = require('fs');
const {Parser, Commands} = require('./modules/Parser');
const {Queue, QueuedCommand} = require('./modules/Queue');

const client = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]});

const cmdQueue = new Queue(client);
const cmd = new Parser();

const app = express();

const Prefix = ";"

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.author === client.user) return;

    var content = message.content;
    var args = cmd.getArguments(content)
    var cmdName = args[0]
    args.shift();

    if (cmdName.substr(0, 1) === Prefix){
        cmdName = cmdName.substr(1);

        if (!cmd.isCommand(cmdName)){
            return message.reply('Invalid command.');
        };

        if (!cmd.typeCheckArguments(cmdName, args)){
            return message.reply("Invalid arguments.");
        }

        cmdQueue.addToList(new QueuedCommand(cmdName, args, message.author, message.channel, message.id));
    }
    
})

app.use(express.json());

app.post("/api/callback/", (request, response) => {
    var parsed = request.body;

    if (parsed === undefined || parsed.UID === undefined) response.send(JSON.stringify({"message": "Failed"}));

    response.send(JSON.stringify({"message": cmdQueue.handleReturn(parsed)}));
})

app.get("/api/get/", (request, response) => {
    response.send(cmdQueue.serializeQueue());
})

const listener = app.listen(31567, () => {
    console.log("Your app is listening on port " + listener.address().port);
    client.login(fs.readFileSync("token.txt", "utf-8"));
});