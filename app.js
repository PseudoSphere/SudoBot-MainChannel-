//--Configs--
const tediousConfig = require("./configs/tedious-config");
const botConfig = require('./configs/bot-config.js');

//--Custom Files--
const chat = require("./chatHandler");
const eCommands = require('./eCommands');

//--NPM Libraries--
const tmi = require('tmi.js');
const tedious = require('tedious');

//--Init--
// TMI.JS
const tmiClient = chat.getClient();

// Tedious
const Connection = tedious.Connection;
const Request = tedious.Request;

//-----------------CHAT HANDLING-----------------------
// Handle chat commands
tmiClient.on('chat', function(channel, userstate, message, self) {
    message = message.toLowerCase();
    eCommands.emit('command', message, userstate['display-name']);

    // Points check
    if(message == "!points") {
        pointsQ(userstate['display-name']);
    }

    //Manual Delta for prizes or errors and things
    if(message.startsWith("!gift") && userstate['username'] == botConfig.admin) {
        let parts = message.split(" ");
        gift(parts);
    }
});

// Handle gifting points
function gift(parts) {
    if(parts.length >= 4) {
        _manualDelta(parts[1], parts[2], parts[3]);
    } else if(parts[0] == "!giftPoints" && parts.length >= 3) {
        pointsDelta(parts[1], parts[2]);
    } else if(parts[0] == "!giftPP" && parts.length >= 3) {
        ppDelta(parts[1], parts[2]);
    }
    // In absense of return values, give a second for database to update. If too slow np
    setTimeout(function() {
        pointsQ(parts[1])
    },1000);  
}

//---------------TMI EVENTS-------------
// Display connect verification
tmiClient.on('connected', function(address, port) {
    chat.action("Channel Upgraded!");
});

// Respond to join event
tmiClient.on('join', function(channel, username, self) {
    tmiClient.whisper("pseudosphere_gaming", ">>" + username + "<< is now viewing the channel.");
});
// Respond to part event
tmiClient.on('part', function(channel, username, self) {
    tmiClient.whisper("pseudosphere_gaming", "<<" + username + ">> has left the channel.");
});

// Temp Stream Feedback Request
setInterval(function() {
    chat.say("In the interest of improvement, \
    I'd like your constructive feedback on the stream. \
    Thanks in advance!");
}, 2400000); // 2400 seconds = 40 minutes


//-------------POINTS-----------
let minute = 0;
// Give Viewers PP Each Minute
setInterval(function() {
    // Log minute for debugging
    console.log("Minute: " + ++minute);
    //Async, someone might miss out on a point, no big deal.
    updateActive();
    setTimeout(function(){
        pointsHub();    
    }, 5000);
}, 60000);

// Handles all points based updates
function pointsHub() {
    let sql = "EXEC pointsHub;";
    _query(sql);
};

// Refresh The activeViewers Table
function updateActive() {
    tmiClient.api({
        url: "http://tmi.twitch.tv/group/user/pseudosphere_gaming/chatters"
    }, function(err, res, body) {
        // Handle failed request
        if(body == undefined){ return 0; } 

        // Gather viewers and format for table insert
        let viewers = body.chatters.viewers;
        let mods = body.chatters.moderators;
        let activesSQL = '';
        mods.forEach(function(viewer) {
            activesSQL += "('" + viewer + "'),";
        }, this);
        viewers.forEach(function(viewer) {
            activesSQL += "('" + viewer + "'),";
        }, this);
        activesSQL = activesSQL.substring(0, activesSQL.length - 1);

        let sql = "DELETE FROM activeViewers; \
                    INSERT INTO activeViewers (name) VALUES " + activesSQL + "; \
                    EXEC upgradeViewers";

       _query(sql);
    });
};

// Single viewer points and pp
function pointsQ(username) {
    // Form SQL
    let sql =  "SELECT * FROM viewers WHERE name = '" + username + "';";
    // Form request
    let request = new Request(sql, function(err, rowCount, rows) {
            //console.log(err);
            //console.log(rowCount + ' row(s) returned');
        }
    );
    request.on('row', function(columns) {
        let message = username + " has " + 
        columns[1].value + " points and " + 
        columns[2].value + " potential points!";
        chat.say(message); 
    });
    request.on('done', function (rowCount, more, rows) { 
        connection.close();
    });
    request.on('doneProc', (rowCount, more, rows) => { 
        connection.close();
    });
    
    //connect and execute request
    const connection = new Connection(tediousConfig);
    connection.on('connect', function(err) {
        if (err) {
            console.log(err)
        }
        else{
            connection.execSql(request);
        }
    });
    // Add error handling
    connection.on('error', (err)=>{
        console.log("Error in pointsQ: ", err)
    });
};

// Manual pointsDelta
function pointsDelta(username, points) {
    _manualDelta(username, points, 0);
}

// Manual ppDelta
function ppDelta(username, pp) {
    _manualDelta(username, 0, pp);
}

// Use manualDelta to modify points when needed (errors, prizes, etc.)
function _manualDelta(username, pointsDelta, ppDelta) {
    let sql = "EXEC manualDelta " + username + "," + pointsDelta + "," + ppDelta + ";";
    _query(sql);
};

// Make query the database (helper function)
function _query(sql) {
    // Create Request
    let request = new Request(sql, (err, rowCount, rows) => {
            //console.log(err);
            //console.log(rowCount + ' row(s) returned');
        }
    );
    request.on('done', (rowCount, more, rows) => { 
        connection.close();
    });
    request.on('doneProc', (rowCount, more, rows) => { 
        connection.close();
    });
    // Connect and query
    const connection = new Connection(tediousConfig);
    connection.on('connect', (err) => {
        if (err) {
            console.log(err)
        } else {
            connection.execSql(request);
        }
    });
    // Add error handling
    connection.on('error', (err) => {
        console.log("Error in _query: ", err)
    });
};