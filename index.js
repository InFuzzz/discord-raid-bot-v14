global.__basedir = __dirname;
const { Client, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({ intents: [32767] });

if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Please update Node on your system.");

//Collections
client.slash = new Collection();

//Utils
client.logger = require('./src/utils/logger');
console.clear();
client.logger.info('Initialisation...');

//Charger les handlers
["slashCommands", "discordEvents"].forEach(file => { 
  require(`./src/utils/handlers/${file}`)(client) 
})

//Set sls cmds
const commands = []
readdirSync("./src/commands/").map(async dir => {
	readdirSync(`./src/commands/${dir}/`).map(async (cmd) => {
	commands.push(require(path.join(__dirname, `./src/commands/${dir}/${cmd}`)))
    })
})
const rest = new REST({ version: "9" }).setToken(config.token);

(async () => {
	try {
		client.logger.info('Rechargement des commandes intégrées...');
		await rest.put(
			Routes.applicationCommands(config.client.id),
			{ body: commands },
		);
		client.logger.info('Commandes intégrées rechargées');
	} catch (error) {
		client.logger.error(error);
	}
})();

//Anti Crash
process.on("unhandledRejection", (err, reason, p) => {
    client.logger.error(err, reason, p);
});
  
process.on("uncaughtException", (err, origin) => {
    client.logger.error(err, origin);
});

client.login(config.token)