const chat = require('./chatHandler');
tmiClient = chat.getClient();


// Set up command object
const EventEmitter = require('events');
class CommandsEmitter extends EventEmitter{}
const commands = new CommandsEmitter();
module.exports = commands;

commands.on('command', (message, username) => {
    // Text Commands
    // Pull out first word
    parsed = message.split(" ");
    command = parsed[0];
    switch(command) {
    case "!deck": case "!decks":
        chat.say('Commonly used decks are listed in the Deck panel below the stream.');
        break;
    case "!egg":
        egg();
    break;
    case "!name":
        chat.say('The Pseudosphere is a fascinating object. \
            My favorite bits about it are 1) its infinite length yet finite volume \
            and surface area equal to that of a sphere of the same central radius 2) \
            its creation using the tractrix, an interesting line in physics and \
            3) its constant negative curvature, opposite that of a sphere.');
        break;
    case'!turn^4':
        chat.say('My monologue on the topic of Turn^4 https://youtu.be/oqBIvkmnHik and Zaldinfox \
        original article https://www.faeria.com/the-hub/guide/148-turn-4');
        break;
    case'!four':
        chat.say('PogChamp TheIlluminati BrokeBack SoBayed Kreygasm BrokeBack \
            PogChamp 4Head TheIlluminati BrokeBack PogChamp SoBayed');
        break;
    case'!misplay':
        chat.say('NotLikeThis FailFish WutFace FailFish BabyRage NotLikeThis');
        break;
    case "!tryme":
        fun(username);
        break;
    case "!end":
        end(username);
        break;
    case "!playlist":
        chat.say("Ultra Chill: https://www.youtube.com/playlist?list=PLEn8zOvezrgrkVlUQgHzwRSaWjauSNOka")
        break;
    default:        
        break;
    }
});

let end = function(user) {
    if(user == "PseudoSphere_Gaming") {
        chat.say("Thank you, everyone, for watching!");
        chat.action("...Powering Down...");
        tmiClient.disconnect();
        process.exit(0);
    } else {
         chat.say("Insufficient permissions...");
    }
};
let say = true;
let fun = function(user) {
    if(say) {
        setTimeout(function() {
            say = true;
        }, 30000);
        say = false;
         chat.say("I'll only say this once. \
            Once every 30 seconds that is. @" + user + " is pretty fun!");
    }
}

let egg = function() {
    if(say) {
        setTimeout(function() {
            say = true;
        }, 30000);
        say = false;
         chat.say("I'm not !eggsactly sure how but typing \
            !egg creates an !eggstremely !eggceptional !eggsperience. \
            !EGGSTRODINARY. PogChamp SoBayed PogChamp");
    }
}