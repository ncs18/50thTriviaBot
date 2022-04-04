'use strict';

require('dotenv').config();

const https = require('https');
const fs = require('fs');

try {
  fs.unlinkSync("indexQA.txt");
} catch (err) {
  console.error(err);
}

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
		const questionArray = ["What is the sky color?", "What color is my underwear?", "What color is grass?"];
		const answerArray = ["blue", "grey", "green"];
		
		const botRegexAnswer = /^\/a*/;

        // Check if the GroupMe message has content and if the regex pattern is true
        if (messageText && botRegexAnswer.test(messageText)) {
			console.log(messageText);
			const answer = messageText.slice(3).toLowerCase();
			console.log(answer);
			const indexA = fs.readFileSync("indexQA.txt");
			console.log(answerArray[indexA]);
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
		
		
        // Learn about regular expressions in JavaScript: https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_Expressions
        const botRegex = /^\/q/;

        // Check if the GroupMe message has content and if the regex pattern is true
        if (messageText && botRegex.test(messageText)) {
            
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
