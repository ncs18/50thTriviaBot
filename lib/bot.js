//Declares requirements
"use strict";

require("dotenv").config();

const https = require("https");
const fs = require("fs");

//Change to total number of questions in q_a_file.txt (total number of lines)
const numberOfQuestions = 15;

//Attempts to delete indexQA file for a clean start if it was not deleted last time
try {
    fs.unlinkSync("indexQA.txt");
} catch (err) {
    console.error(err);
}

//Loads the q_a_file.txt and converts it into two separate arrays
try {
    var buffer = fs.readFileSync("q_a_file.txt");
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

//Display Arrays for debug purposes
//console.log(questionArray);
//console.log(answerArray);

//RegEx commands for the bot to recognize in messages
const botQuestion = /^\/q/;

//Boolean for auto-asking question upon correct answer
var askQuestion = true;

class Bot {
    /**
     * Called when the bot receives a message.
     *
     * @static
     * @param {Object} message The message data incoming from GroupMe
     * @return {string}
     */
    static checkMessage(message) {
        //Sets messageText equal to the new message
        const messageText = message.text;

        //Attempts to read indexQA.txt for array reference number
        try {
            var indexA = fs.readFileSync("indexQA.txt");
        } catch (err) {
            
        }

        //ANSWER MATCHING IF STATEMENT
        if (messageText.toLowerCase() == answerArray[indexA]) {
            //First it deletes the indexQA file for a fresh start
            try {
                fs.unlinkSync("indexQA.txt");
            } catch (err) {
                console.error(err);
            }
            //Then the askQuestion boolean is set to true to trigger another question
            askQuestion = true;
            //Finally the bot sends a correct message to the chat
            return "Correct!";
        }

        //QUESTION ASKING IF STATEMENT BASED ON BOOLEAN 'askQuestion'
        if (askQuestion == true) {
            //Generates random number based on number of questions in q_a_file.txt
            const indexQA = Math.floor(Math.random() * numberOfQuestions);

            //Creates new file with random number stored
            try {
                fs.writeFileSync("indexQA.txt", indexQA.toString());
            } catch (err) {
                console.error(err);
            }

            //Sets askQuestion to false to only ask once
            askQuestion = false;
            //Sends question from array using common random number
            return questionArray[indexQA];
        }

        //QUESTION ASKING IF STATEMENT BASED ON /q COMMAND (used to start asking questions)
        if (messageText && botQuestion.test(messageText)) {
            ////Generates random number based on number of questions in q_a_file.txt
            const indexQA = Math.floor(Math.random() * numberOfQuestions);

            //Creates new file with random number stored
            try {
                fs.writeFileSync("indexQA.txt", indexQA.toString());
            } catch (err) {
                console.error(err);
            }

            //Sets askQuestion to false to only ask once
            askQuestion = false;
            //Sends question from array using common random number
            return questionArray[indexQA];
        } else {
            return null;
        }
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
