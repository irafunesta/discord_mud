const loki = require('lokijs');

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

function ZoneFactory(zoneOp) {
	return Object.assign({}, zoneOp);
}

var databaseInitialize = function databaseInitialize(callback) {
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

	// kick off any program logic or start listening to external events
	callback();
}
