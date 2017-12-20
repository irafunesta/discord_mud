/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// Import the discord.js module
const Discord = require('discord.js');
const loki = require('lokijs');
const config = require('./config.js');
const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 0.5 };

var msgUtils = require('./messages.js');
// Create an instance of a Discord client
const client = new Discord.Client();
// The token of your bot - https://discordapp.com/developers/applications/me
const token = config.GetToken();

//Lokydb
var db = new loki('./data/game.json', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});

var characters = null;
var zones = null;
var commandList = null;

var defaultZone = {
	id: 0,
	name: 'Spawn',
	exits: [1,2]
}

var swipeAfkUserId = 0;
var swipeInterval = 10;
var maxIdleTime = 30;

function ZoneFactory(zoneOp) {
	return Object.assign({}, zoneOp);
}

function databaseInitialize() {
	characters = db.getCollection("characters");
	zones = db.getCollection('zones');
	commandList = db.getCollection('commandList');


	if (characters === null) {
		characters = db.addCollection("characters");
	}
	if(zones === null) {
		zones = db.addCollection('zones');
		zones.insert(defaultZone);

		//Add two sample zones
		var lastZoneId = zones.count();
		zones.insert(ZoneFactory({
			name:"Town",
			id:lastZoneId,
			exits: [0, 2]
		}));
		lastZoneId++;
		zones.insert(ZoneFactory({
			name:"Forest",
			id:lastZoneId,
			exits: [0, 1]
		}));
	}
	if(commandList === null) {
		commandList = db.addCollection('commandList');
		commandList.insert({name:'help', desc:'Show this list'});
		commandList.insert({name:'login', desc:'Create or login in a character'});
		commandList.insert({name:'zone', desc:'Show the zone you are current in'});
		commandList.insert({name:'who', desc:'Show the player in your current zone'});
		commandList.insert({name:'exits', desc:'Show the zone connected to your current zone'});
		commandList.insert({name:'move', desc:'Change to a close zone'});


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

function CreateMonster(monsterOp){
	return Object.assign({}, {
		name : 'Bat',
		hp: 3,
		str: 3,
		def: 4
	}, monsterOp);
}

function CreateCharacter(charOp) {
	return Object.assign({}, {
		user_id: '12312312',
		name:'charName', //TODO make this unique
		zone: defaultZone.id,
		status: 'idle',
		online: true,
		lastMessageTime: '',
		hp: '10',
		str: '5',
		def: '5'
	}, charOp);
}

function GetCharacter(id, _online = false)
{
	return characters.findOne({
		user_id:id,
		online:_online
	});
}

function GetAllCharacter(id)
{
	return characters.findOne({
		user_id:id
	});
}

function AfkSwipe()
{
	console.log("Start Afk swipe");
	var allChar = characters.find({online: true});

	for(var i in allChar) {
		var currentChar = allChar[i];
		var timeSinceLastMessage = currentChar.lastMessageTime - currentChar.prevMessageTime;

		console.log(currentChar.name, '- timeSinceLastMessage:', timeSinceLastMessage);

		if(timeSinceLastMessage > maxIdleTime * 1000)
		{
			//the user is logged out
			currentChar.online = false;
			console.log(currentChar.name, 'logged off');
			characters.update(currentChar);
		}
		// allCharacters[i].prevMessageTime = 3;
	}
}

function Run() {
	var count = 0;
	var monsters = ['snake', 'bat', 'large bat', 'infected rat'];

	// The ready event is vital, it means that your bot will only start reacting to information
	// from Discord _after_ ready is emitted
	client.on('ready', () => {
	  console.log('I am ready!', new Date().toISOString());

	  var vConns = client.voiceConnections;
	  // var user
	  // console.log("VoiceConnections", vConns);
	  console.log("VoiceConnections first", vConns.first());
	});

	function ParseMessage(message)
	{
		try
		{
			//Check if asking for the simo-bot
			var arr = message.content.split(':?');
			var userid = message.author.id;

			if(arr[0] == '!g')
			{
				var char = GetAllCharacter(userid);	//Get the character only if the bot is interpelled
				// console.log("char:", char);
				//Update the char whit is last message
				if(char && char.online == true) {
					if(char.prevMessageTime === 3)
					{
						//First time messages
						char.prevMessageTime = message.createdTimestamp;
					}
					else {
						char.prevMessageTime = char.lastMessageTime;
					}

					char.lastMessageTime = message.createdTimestamp;
					characters.update(char);
					// console.log(char.prevMessageTime);
				}

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
					case 'getChar':
						//!g:createAccount:name:pswd:emal
						// var userid = message.author.id;
						// var char = characters.findOne({user_id:userid});
						console.log(JSON.stringify(char));
						message.channel.send(JSON.stringify(char));
					break;
					case 'login':
						//Check if the user has a char or make a new one
						//need to pass the name of the char
						if(char) {
							//Greete the create character
							// message.channel.send("Welcome back to the world " + char.name);
							message.channel.send(msgUtils.getMessage("WELCOME_BACK", [char.name]));
							char.online = true;
							characters.update(char);
						}
						else if(arr[2]) {
							//Make new char
							var charName = arr[2];
							var charWhitSameName = characters.find({name:charName});
							if(charWhitSameName.length > 0)
							{
								//char names need to be unique
								message.channel.send("The name " + charName +
									'is already taken. \n Please use another name');
							}
							else {
								characters.insert(CreateCharacter({
									user_id: userid,
									name:charName,
									online: true,
									lastMessageTime: message.createdTimestamp,
									prevMessageTime: 3
								}));

								// message.channel.send("Welcome to the world " + charName +
								// 	' !. \n Type !g:help for a list of command. Have fun');
								message.channel.send(msgUtils.getMessage("WELCOME_NEW", [charName]));
							}
						}
						else {
							//Error need a name of the character
							message.channel.send("The login command need a name as a parameter.");
						}
					break;
					case 'zone':
						//Tell the current zone the player is in
						// var char = characters.findOne({user_id:userid});
						if(char) {

							console.log(char);
							var zone = zones.findOne({id:char.zone});
							if(zone) {
								console.log(zone);
								message.channel.send("You are in " + zone.name);
							}
							else {
								message.channel.send("Error no map whit id: " + char.zone);
							}
						}
						else {
							message.channel.send("You need to make a character to play");
						}
					break;
					case 'who':
						//Tell the current zone the player is in
						// var char = characters.findOne({user_id:userid});
						var zone = zones.findOne({id:char.zone});
						if(char && char.online == true) {
							var charInzone = characters.find({
								'zone': char.zone
								// 'user_id':{
								// 	'$ne':char.user_id
								// }
							});

							var msg = charInzone.length.toString() + ' player in ' + zone.name + "\n";
							charInzone.forEach(function(item) {
								msg += item.name + "\n";
							});

							if(msg === null) {
								msg = "0 player in " + zone.name;
							}
							message.channel.send(msg);
						}
						else {
							message.channel.send("You need to make a character to play");
						}
					break;
					case 'exits':
						//Tell the current zone the player is in
						// var char = characters.findOne({user_id:userid});
						if(char && char.online == true) {
							var zone = zones.findOne({id:char.zone});
							var msg = '';
							var exits = zone.exits;

							exits.forEach(function(exit) {
								var ce = zones.findOne({id:exit});
								if(ce){
									msg += exit +"-"+ ce.name + "\n";
								}
							});

							if(msg === '') {
								msg = "0 exits";
							}
							message.channel.send(msg);
						}
						else {
							message.channel.send("You need to make a character to play");
						}
					break;
					case 'move':
						// var char = characters.findOne({user_id:userid});
						if(char && char.online == true) {
							//Greete the create character
							// message.channel.send("Welcome back to the world " + char.name);
							if(arr[2]) {
								//Move the char
								var selectedZone = parseInt(arr[2]);
								if(selectedZone === char.zone)
								{
									message.channel.send("You are already in this zone");
								}
								else {
									var zone = zones.findOne({id:selectedZone});
									if(zone) {
										char.zone = selectedZone;
										characters.update(char);
										message.channel.send("You moved to " + zone.name);
									}
									else {
										message.channel.send("Zone not found.");
									}
								}
							}
							else {
								//Error need a name of the character
								message.channel.send("The move command need a zone id as a parameter.");
							}
						}
						else {
							message.channel.send("You need to make a character to play");
						}
					break;

					case 'help':
						var msg = '';
						var commands = commandList.find({});

						console.log("commands:" + commands);
						if(commands){
							commands.forEach(function(item) {
								msg += item.name +": " + item.desc + "\n";
							});

							message.channel.send(msg);
						}
					break;
					case 'createZone':
						if(arr[2]) {
							var zoneName = arr[2];
							var lstZone = zones.count();

							zones.insert({
								id: lstZone,
								name: zoneName
							});

						}
						else {
							message.channel.send("The createZone command need a zone name as a parameter.");
						}
					break;
					case 'music':
						if (!message.guild) return;

						// Only try to join the sender's voice channel if they are in one themselves
						if (message.member.voiceChannel)
						{
							if(arr[2])
							{
								var ytstram = arr[2];
								// console.log("video :", ytstram);
								// var lstZone = zones.count();
								message.member.voiceChannel.join()
								    .then(connection =>
									{
										// Connection is an instance of VoiceConnection
								    	message.reply('I have successfully connected to the channel!');
										console.log("now playing music :", ytstram);

										const stream = ytdl(ytstram, { filter : 'audioonly' });
		    			  				const dispatcher = connection.playStream(stream, streamOptions);

										dispatcher.on('end', () =>
										{
										  // The song has finished
										  console.log("Song ended");
										});

										dispatcher.on('error', e =>
										{
										  // Catch any errors that may arise
										  console.log("err:", e);
										  dispatcher.end(); // End the dispatcher, emits 'end' event
										});

									// dispatcher.setVolume(0.5); // Set the volume to 50%
									// dispatcher.setVolume(1); // Set the volume back to 100%

									// console.log(dispatcher.time); // The time in milliseconds that the stream dispatcher has been playing for

									// dispatcher.pause(); // Pause the stream
									// dispatcher.resume(); // Carry on playing
								    }).catch(console.log);
							}
							else {
								message.channel.send("The createZone command need a zone name as a parameter.");
							}
						}
						else
						{
						  message.reply('You need to join a voice channel first!');
						}
					break;
					case 'exitVoice':
						var vConns = client.voiceConnections;
						// var user
						// console.log("VoiceConnections", vConns);
						console.log("VoiceConnections\n", vConns.first());
						if (vConns != undefined && vConns.first())
						{
							console.log("Is in voice channel");
							client.voiceConnections.first().channel.leave();
						}
						else
						{
						  message.reply('Not in a voice channel');
						}
					break;
					default:
						message.channel.send("Wrong command type !g:help for a list of command.");
					break;
				}
			}
		}
		catch(err)
		{
			console.log("Error parsing msg:", err);
		}
	}

	// Create an event listener for messages
	client.on('message', message => {
	  ParseMessage(message);
	});

	client.on('error', err =>{
		console.log("An error occurred", err);
	});

	client.on('guildMemberAdd', member => {
	  // Send the message to a designated channel on a server:
	  const channel = member.guild.channels.find('name', 'member-log');
	  // Do nothing if the channel wasn't found on this server
	  if (!channel) return;
	  // Send the message, mentioning the member
	  channel.send(`Welcome to the server, ${member}`);
	});

	//Handle exit events
	process.stdin.resume();//so the program will not close instantly

	function exitHandler(options, err) {
	    if (options.cleanup)
		{
			console.log('Exiting program, disconnect from voice');
			if (vConns != undefined && vConns.first())
			{
				console.log("Is in voice channel");
				client.voiceConnections.first().channel.leave();
			}
			console.log('Exiting program, destroy client');

			client.destroy();
		}
	    if (err) console.log(err.stack);
	    if (options.exit) process.exit();
	}

	//do something when app is closing
	process.on('exit', exitHandler.bind(null,{cleanup:true}));

	//catches ctrl+c event
	process.on('SIGINT', exitHandler.bind(null, {exit:true}));

	// catches "kill pid" (for example: nodemon restart)
	process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
	process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

	//catches uncaught exceptions
	process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

	// Log our bot in
	client.login(token);
}
