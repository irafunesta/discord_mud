//Run this in node to make a db update whitout deleting the data

const loki = require('lokijs');

var db = new loki('./data/game.json', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});

function databaseInitialize() {
	characters = db.getCollection("characters");

	if (characters === null) {
		characters = db.addCollection("characters");

	}

	//Update all the characters to have a new value
	//prevMessageTime

	var allCharacters = characters.find({});
	console.log(allCharacters);

	var i = 0;
	for(var i in allCharacters) {
		allCharacters[i].level = 0;
		allCharacters[i].exp = 0;
		allCharacters[i].exp_next_level = 0;

		characters.update(allCharacters[i]);
	}

	// console.log("Updated ", i, " lines");
}
