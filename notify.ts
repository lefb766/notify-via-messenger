import request = require('request');
import path = require('path');
import os = require('os');
import fs = require('fs');

const configFilePath = path.join(os.homedir(), '.notify-via-messenger.json');

if (!fs.statSync(configFilePath).isFile()) {
    console.error("Error: Config file (%s) does not exist.", configFilePath);
    process.abort();
}

interface Config {
    accessToken: string,
    userId: string
}

const config: Config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

if (process.argv.length <= 2) {
    console.error("Error: Give a message to transmit in a command argument.");
    process.abort();
}

let message = process.argv[2];

let body = {
    recipient: {
        id: config.userId
    },
    message: {
        text: message
    }
};

let url = "https://graph.facebook.com/v2.6/me/messages?access_token=" + config.accessToken;

request.post(url, {
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
});