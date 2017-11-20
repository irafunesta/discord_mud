/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// Import the discord.js module
const Discord = require('discord.js');
const loki = require('lokijs');
// Create an instance of a Discord client
const client = new Discord.Client();
// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'MzgxNzk0NDM4NDE2MDM5OTM3.DPMZuA.m6brNk90VQMDHk_gMTLedJNS77k';

//Lokydb
var db = new loki('./data/loki.json', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});

function databaseInitialize() {
	var accounts = db.getCollection("accounts");

	if (accounts === null) {
		accounts = db.addCollection("accounts");
	}

	// var userDoc = {
	// 	username:'Simo',
	// 	pswd:'asd',
	// 	email:'asd'
	// };

	// accounts.insert(userDoc);

	// kick off any program logic or start listening to external events
	Run();
}

function GetMonster()
{
	return monsters[RandomRange(0, 3)];
}

function RandomRange(min = 0, max = 5)
{
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function Run() {
	var count = 0;
	var monsters = ['snake', 'bat', 'large bat', 'infected rat'];

	// The ready event is vital, it means that your bot will only start reacting to information
	// from Discord _after_ ready is emitted
	client.on('ready', () => {
	  console.log('I am ready!');
	});

	function ParseMessage(message)
	{
		//Check if asking for the simo-bot
		var arr = message.content.split(':');
		if(arr[0] == '!g')
		{
			switch(arr[1])
			{
				case 'ping':
					message.channel.send('pong');
				break;
				case 'rand':
					message.channel.send('your number is :' + RandomRange(2, 3));
				break;
				case 'f':
					message.channel.send('you will fight :' + GetMonster());
				break;
				case 'name':
					var res = db.getCollection("accounts").find({});
					console.log(res);
					message.channel.send('res:' + JSON.stringify(res));
				break;
			}
		}
	}

	// Create an event listener for messages
	client.on('message', message => {
	  ParseMessage(message);
	});

	// Log our bot in
	client.login(token);
}
