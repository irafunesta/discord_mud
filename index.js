/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// Import the discord.js module
const Discord = require('discord.js');

//TingoDB
var Engine = require('tingodb')();
var db = new Engine.Db('./data/tingo', {});

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'MzgxNzk0NDM4NDE2MDM5OTM3.DPMZuA.m6brNk90VQMDHk_gMTLedJNS77k';

var count = 0;
var monsters = ['snake', 'bat', 'large bat', 'infected rat'];

function GetMonster()
{
	return monsters[RandomRange(0, 3)];
}

function RandomRange(min = 0, max = 5)
{
	return Math.floor(Math.random() * (max - min + 1) + min);
}

//DB init

var userDoc = {
	username:'Simo',
	pswd:'asd',
	email:'asd'
};

// db.createCollection('accounts', {}, function(err, collection){
// 	if(err)
//     {
//   	  console.log('insert account: ', err);
//     }
//     else {
//     	console.log('creation success');
//     }
// });

var collection = db.collection("accounts");
collection.insert(userDoc, {w:1}, function (err, newDoc) {   // Callback is optional
  // newDoc is the newly inserted document, including its _id
  // newDoc has no key called notToBeSaved since its value was undefined
  if(err)
  {
	  console.log('insert account: ', err);
  }
  else {
	console.log('insert account success');
  }
});

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
				// db.find({"user.name":"Simo"}, function(err, docs) {
				// 	if(err)
				// 	{
				// 		console.log('finding name error:', err);
				// 	}
				// 	else
				// 	{
				// 		//Works fine probably due to enclosur
				// 		console.log('finding name res:', docs);
				// 		message.channel.send(JSON.stringify(docs));
				// 	}
				// });
			break;
		}
	}
}

// Create an event listener for messages
client.on('message', message => {
  // If the message is "ping"
  // if (message.content === '!g:ping') {
  //   // Send "pong" to the same channel
  //   message.channel.send('pong');
  // }
  // if(message.content === '!g:rand') {
	//  message.channel.send('your number is :' + RandomRange(2, 3));
  // }
  // if(message.content === '!g:f') {
	// message.channel.send('you will fight :' + GetMonster());
  // }
  ParseMessage(message);
});

// Log our bot in
client.login(token);
