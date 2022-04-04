'use strict';

require('dotenv').config();

const https = require('https');
const fs = require('fs');

//Attempt to delete indexQA file for a clean start if it was not deleted last time
try {
  fs.unlinkSync("indexQA.txt");
} catch (err) {
  console.error(err);
}

//Establish question and answer arrays, questions and answers must match array positions
const questionArray = ["What continent is the USA located on?", "What is the nickname of the MQ-9", "What town is Shaw AFB located in?","Boldface for Engine Fire/RPM Decay on the Ground"];
const answerArray = ["north america", "reaper", "sumter","condition lever-aft"];

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
			} 
			else { 
				return "Incorrect";
			}
			
		}
        
        //Asks question based off seeing a /q
        if (messageText && botQuestion.test(messageText)) {
            
			const indexQA = Math.floor(Math.random()*3);
			
			console.log(indexQA);
			
			try {
				fs.writeFileSync('indexQA.txt', indexQA.toString());
			} catch (err) {
				console.error(err);
			}
			
			return questionArray[indexQA];
        }
		
        return null;
    };

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
            hostname: 'api.groupme.com',
            path: '/v3/bots/post',
            method: 'POST'
        };

        const body = {
            bot_id: botId,
            text: messageText
        };

        // Make the POST request to GroupMe with the http module
        const botRequest = https.request(options, function(response) {
            if (response.statusCode !== 202) {
                console.log('Rejecting bad status code ' + response.statusCode);
            }
        });

        // On error
        botRequest.on('error', function(error) {
            console.log('Error posting message ' + JSON.stringify(error));
        });

        // On timeout
        botRequest.on('timeout', function(error) {
            console.log('Timeout posting message ' + JSON.stringify(error));
        });

        // Finally, send the body to GroupMe as a string
        botRequest.end(JSON.stringify(body));
    };
};

module.exports = Bot;
