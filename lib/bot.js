//Declares requirements
"use strict";

require("dotenv").config();

const https = require("https");
const fs = require("fs");

//Change to total number of questions in q_a_file.txt (total number of lines)
const numberOfQuestions = 15;
const dollarAmount = 50;

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
        const messageUserID = message.user_id;

        //Attempts to read indexQA.txt for array reference number
        try {
            var indexA = fs.readFileSync("indexQA.txt");
        } catch (err) {}

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

            //------------------------------------------------------------------------//

            //Reads current money values
            try {
                var moneyTrackerBuffer = fs.readFileSync("userMoney.txt");
            } catch (err) {}

            var moneyFile = moneyTrackerBuffer.toString();
            var userMoneyArray = moneyFile.split(",");
            var userIdentities = [];
            var moneyAmounts = [];
            var userMoneyCombine = [];

            for (var i = 0; i < userMoneyArray.length; i++) {
                var userAdd = userMoneyArray[i].split(":")[0];
                var moneyAdd = userMoneyArray[i].split(":")[1];
                userIdentities.push(userAdd);
                moneyAmounts.push(moneyAdd);
            }

            console.log(userIdentities);
            console.log(moneyAmounts);

            for (var j = 0; j < userIdentities.length; j++) {
                if (messageUserID == userIdentities[j]) {

                    moneyAmounts[j] = Number(moneyAmounts[j]) + dollarAmount;
                    var moneyForMessage = moneyAmounts[j];

                    for (var k = 0; k < moneyAmounts.length; k++) {
                        var userCombine = userIdentities[k];
                        var moneyCombine = moneyAmounts[k];
                        userMoneyCombine.push(userCombine + ":" + moneyCombine);
                    }
                    try {
                        fs.writeFileSync("userMoney.txt",userMoneyCombine.toString());
                    } catch (err) {
                        console.error(err);
                    }
                } else if (messageUserID != userIdentities[j]) {
                    userMoneyArray.push(messageUserID + ":" + 50);
                    try {
                        fs.writeFileSync("userMoney.txt",userMoneyArray.toString());
                    } catch (err) {
                        console.error(err);
                    }
                    this.sendMessage("Correct! You now have $50");
                }
            }

            console.log(userMoneyCombine);
            console.log(userMoneyArray);
            this.sendMessage("Correct! You now have $" + moneyForMessage);
            //---------------------------------------------------------------------------//

            //Finally the bot sends a correct message to the chat
            //return "Correct! Nice work " + messageUserID + "!";
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
