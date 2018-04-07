const botConfig = require('./configs/bot-config');
channel = botConfig.channel;

const tmiConfig = require("./configs/tmi-config");
const tmi = require('tmi.js');
const tmiClient = new tmi.client(tmiConfig);
const tmiConnect = tmiClient.connect();

module.exports = {
    say,
    action,
    getClient
}

function getClient() {
    return tmiClient;
};

let messageCount = 0;
let resting = false;
function say(message) {
    // Stop after 25 messages in 20 seconds
    if (messageCount < 25) {
        // Timer on message count
        setTimeout(function () {
            messageCount--;
            if (resting) {
                resting = false;
                this.action("Ready to go!");
            }
        }, 20000); // 20 seconds

        // All good, send it off
        messageCount++;
        tmiClient.say(channel, message);
    } else if (!resting) {
        // Alert the channel of resting
        this.action("Let me catch my breath.");
        resting = true;
    }
};

function action(message) {
    tmiClient.action(channel, message);
};