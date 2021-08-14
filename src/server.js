const Discord = require('discord.js');
const express = require("express");
const fs = require('fs');
const {Parser, Commands} = require('./modules/Parser');
const {Queue, QueuedCommand} = require('./modules/Queue');
const { 
    v4: uuid
} = require('uuid');

const client = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]});

const whitelistedGames = {};
const cmdQueue = new Queue(client);
const cmd = new Parser();

const app = express();

const Prefix = ";"

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

var gameSpecificString = "-game-specific"
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    var content = message.content;
    var args = cmd.getArguments(content)

    var cmdName = args[0]
    args.shift();

    var gameId = "all";
    var whitelistedGame = true;
    var isGameSpecific = false;

    if (cmdName.length > gameSpecificString.length) {
        if (cmdName.substr(cmdName.length - gameSpecificString.length) == gameSpecificString) {
            cmdName = cmdName.substr(0, cmdName.length - gameSpecificString.length)
            gameId = args[0];
            whitelistedGame = Object.keys(whitelistedGames).filter(x => {
                return String(whitelistedGames[x]) === gameId;
            }).shift() !== undefined;

            args.shift();
            isGameSpecific = true;
        }
    }

    if (cmdName.substr(0, 1) === Prefix){
        if (cmdName.includes('```')){
            content = cmdName.substr(0, cmdName.indexOf('```')-1) + " " + content.substr(cmdName.indexOf('```'));
            args = cmd.getArguments(content);
            cmdName = args[0]

            args.shift();
            if (isGameSpecific) args.shift();
        }

        cmdName = cmdName.substr(1);

        if (!cmd.isCommand(cmdName)){
            return message.reply('Invalid command.');
        };

        var TypeCheck = cmd.typeCheckArguments(cmdName, args);
        if (TypeCheck[0] !== true){
            return message.reply(
                `Invalid argument: \`${TypeCheck[0]}\`. Your input: \`${TypeCheck[1]}\`, expected a \`${TypeCheck[2]}\`.`);
        }

        if (!whitelistedGame){
            return message.reply(`Place ID (${gameId}) provided not whitelisted.`)
        }

        cmdQueue.addToList(new QueuedCommand(cmdName, args, gameId, message.author, message.channel, message.id));
    }
    
})

app.use(express.json());

app.post('/api/connect/', (request, response) => {
    var parsed = request.body;

    if (parsed === undefined || parsed.GameID === undefined) return response.send(JSON.stringify({"message": "Failed"}));

    var exists = Object.keys(whitelistedGames).filter(x => {
        return whitelistedGames[x] === parsed.GameID;
    }).shift();

    if (exists) return response.send(JSON.stringify({"UID": exists, "message": 'Success'}));
    
    var UID = uuid();
    whitelistedGames[UID] = parsed.GameID;

    response.send(JSON.stringify({"UID": UID, "message": 'Success'}));
})

app.post("/api/callback/", (request, response) => {
    var parsed = request.body;

    if (parsed === undefined || parsed.UID === undefined || parsed.GameUID === undefined || parsed.GameID === undefined)
        return response.send(JSON.stringify({"message": "Failed"}));
    
    if (whitelistedGames[parsed.GameUID] === undefined || whitelistedGames[parsed.GameUID] !== parsed.GameID)
        return response.send(JSON.stringify({"message": "Not whitelisted."}));

    response.send(JSON.stringify({"message": cmdQueue.handleReturn(parsed)}));
})

app.get("/api/get/", (request, response) => {
    response.send(cmdQueue.serializeQueue());
})

const listener = app.listen(31567, () => {
    console.log("Your app is listening on port " + listener.address().port);
    client.login(fs.readFileSync("token.txt", "utf-8"));
});