var msgTable = {
	'NO_CHAR_OR_LOGIN': "You need to make a character and login to play",
	'WELCOME_NEW': "Welcome to the world $.0 !. \n Type !g:help for a list of command. Have fun'",
	'WELCOME_BACK': "Welcome back to the world $.0",
	'TEST':"test for multiple params: $.0, $.1, $.2"
};

var getMessage = function getMessage (id, params) {
	var result = msgTable[id];
	for (var i in params)
	{
		result = result.replace("$." + i.toString(), params[i]);
	}
	return result;
};

module.exports.msgTable = msgTable;
module.exports.getMessage = getMessage;
