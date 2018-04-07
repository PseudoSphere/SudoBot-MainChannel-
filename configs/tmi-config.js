module.exports = {
    options: {
        debug: true
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: "SudoBot_",
        //username: process.env.twitchUsername,
        password: "oauth:<unique oath token>"
        //password: process.env.twitchPassword
    },
    channels: ["pseudosphere_gaming"]
};