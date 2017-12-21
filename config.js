var config = {
	token : "MzkyOTg0MTQ1NjIzNTE1MTM2.DRvKlw.G3vch2wTDtMUB_fgzgSRMXWFoX8",
	command_separetor : ":?",
}

var GetToken = function GetToken () {
	return config.token;
};

// module.exports.GetToken = GetToken;
// module.exports.= config;

module.exports = {
	"GetToken": GetToken,
	"command_separetor" : config.command_separetor
}
// module.exports.getMessage = getMessage;
