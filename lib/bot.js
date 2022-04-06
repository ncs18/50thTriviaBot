"use strict";

require("dotenv").config();

const https = require("https");
const fs = require("fs");

//Attempt to delete indexQA file for a clean start if it was not deleted last time
try {
    fs.unlinkSync("indexQA.txt");
} catch (err) {
    console.error(err);
}

//Establish question and answer arrays, questions and answers must match array positions

var buffer = null;

try {
    buffer = fs.readFileSync("q_a_file.txt");
} catch (err) {
    console.error(err);
}

var qaFileArray = buffer.toString();

var masterArray = qaFileArray.split("\r\n");

var questionArray = [];
var answerArray = [];

for (var i = 0; i < masterArray.length; i++) {
    var question = masterArray[i].split("?")[0] + "?";
    var answer = masterArray[i].split("?")[1];
    questionArray.push(question);
    answerArray.push(answer);
}

console.log(questionArray);
console.log(answerArray);

class Bot {
    /**
     * Called when the bot receives a message.
     *
     * @static
     * @param {Object} message The message data incoming from GroupMe
     * @return {string}
     */
    static checkMessage(message) {
        const messageText = message.text;
        const botQuestion = /^\/q/;
        const botAnswer = /^\/a/;

        //tests answer based off seeing /a
        if (messageText && botAnswer.test(messageText)) {
            const answer = messageText.slice(3).toLowerCase();
            var indexA = null;

            try {
                indexA = fs.readFileSync("indexQA.txt");
            } catch (err) {
                return null;
            }

            if (answer == answerArray[indexA]) {
                try {
                    fs.unlinkSync("indexQA.txt");
                } catch (err) {
                    console.error(err);
                }
                return "Correct!";
            } else {
                return null;
            }
        }

        //Asks question based off seeing a /q
        if (messageText && botQuestion.test(messageText)) {
            const indexQA = Math.floor(Math.random() * 4);

            console.log(indexQA);

            try {
                fs.writeFileSync("indexQA.txt", indexQA.toString());
            } catch (err) {
                console.error(err);
            }

            return questionArray[indexQA];
        }

        return null;
    }

    /**
     * Sends a message to GroupMe with a POST request.
     *
     * @static
     * @param {string} messageText A message to send to chat
     * @return {undefined}
     */
    static sendMessage(messageText) {
        // Get the GroupMe bot id saved in `.env`
        const botId = process.env.BOT_ID;

        const options = {
            hostname: "api.groupme.com",
            path: "/v3/bots/post",
            method: "POST",
        };

        const body = {
            bot_id: botId,
            text: messageText,
        };

        // Make the POST request to GroupMe with the http module
        const botRequest = https.request(options, function (response) {
            if (response.statusCode !== 202) {
                console.log("Rejecting bad status code " + response.statusCode);
            }
        });

        // On error
        botRequest.on("error", function (error) {
            console.log("Error posting message " + JSON.stringify(error));
        });

        // On timeout
        botRequest.on("timeout", function (error) {
            console.log("Timeout posting message " + JSON.stringify(error));
        });

        // Finally, send the body to GroupMe as a string
        botRequest.end(JSON.stringify(body));
    }
}

module.exports = Bot;
