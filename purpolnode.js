var fs = require("fs");
require('vm').runInThisContext(fs.readFileSync(__dirname + "/purpol.js"));
var purpol_program = fs.readFileSync(0).toString();
console.log(purpol(purpol_program));
