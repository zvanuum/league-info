'use strict';


process.env.DEBUG = 'actions-on-google:*';
const DialogflowApp = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');

const https = require('https');
const host = 'https://na1.api.riotgames.com';
const champions = '/lol/static-data/v3/champions';
const apiKey = 'RGAPI-51918406-c03f-4c8d-bb93-42d874980db6';

const googleAssistantRequest = 'google';
const actions = {
    GET_CHAMPION: 'get-champion'
};

const parameters = {

};

const contexts = {

};

function processRequest(request, response) {
    let action = request.body.result.action;
    let parameters = request.body.result.parameters;
    let inputContexts = request.body.result.contexts;
    let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;

    console.log(request.body);
    console.log('ACTION:', action);

    const app = new DialogflowApp({ request, response });
    const actionHandlers = {
        'input.welcome': () => {
            if (requestSource === googleAssistantRequest) {
                sendGoogleResponse('Hello, Welcome to my Dialogflow agent!');
            } else {
                sendResponse('Hello, Welcome to my Dialogflow agent!');
            }
        },
        'default': () => {
            if (requestSource === googleAssistantRequest) {
                sendGoogleResponse({
                    speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
                    text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)'
                });
            } else {
                sendResponse({
                    speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
                    text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)'
                });
            }
        },
        [actions.GET_CHAMPION]: () => {
            if (requestSource === googleAssistantRequest) {
                sendGoogleResponse({
                    speech: 'fvlsdbfs',
                    text: 'fvlsdbfs'
                });
            } else {
                sendResponse({
                    speech: 'fvlsdbfs',
                    text: 'fvlsdbfs'
                });
            }
        }
    };

    if (!actionHandlers[action]) {
        action = 'default';
    }

    actionHandlers[action]();



    // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
    function sendGoogleResponse(responseToUser) {
        if (typeof responseToUser === 'string') {
            app.ask(responseToUser); // Google Assistant response
        } else {
            // If speech or displayText is defined use it to respond
            let googleResponse = app.buildRichResponse().addSimpleResponse({
                speech: responseToUser.speech || responseToUser.displayText,
                displayText: responseToUser.displayText || responseToUser.speech
            });
            // Optional: Overwrite previous response with rich response
            if (responseToUser.googleRichResponse) {
                googleResponse = responseToUser.googleRichResponse;
            }
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            if (responseToUser.googleOutputContexts) {
                app.setContext(...responseToUser.googleOutputContexts);
            }

            console.log('Response to Dialogflow (AoG): ' + JSON.stringify(googleResponse));
            app.ask(googleResponse); // Send response to Dialogflow and Google Assistant
        }
    }

    // Function to send correctly formatted responses to Dialogflow which are then sent to the user
    function sendResponse(responseToUser) {
        // if the response is a string send it as a response to the user
        if (typeof responseToUser === 'string') {
            let responseJson = {};
            responseJson.speech = responseToUser; // spoken response
            responseJson.displayText = responseToUser; // displayed response
            response.json(responseJson); // Send response to Dialogflow
        } else {
            // If the response to the user includes rich responses or contexts send them to Dialogflow
            let responseJson = {};
            // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;
            // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
            responseJson.data = responseToUser.data;
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            responseJson.contextOut = responseToUser.outputContexts;

            console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
            response.json(responseJson); // Send response to Dialogflow
        }
    }
}

exports.leagueInfo = functions.https.onRequest((request, response) => {
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    processRequest(request, response);
});

// exports.leagueInfo = functions.https.onRequest((req, res) => {
//     getChampions()
//         .then(champions => {
//             const randomIndex = Math.floor(Math.random() * champions.length);

//             res.setHeader('Content-Type', 'application/json');
//             res.send(JSON.stringify({
//                 "speech": champions[randomIndex].name,
//                 "displayText": champions[randomIndex].name
//             }));
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).send();
//         });
// });

// function getChampions() {
//     return new Promise((resolve, reject) => {
//         let path = `${champions}?api_key=${apiKey}`;

//         console.log('API Request: ' + `${host}${champions}?api_key=${apiKey}`);

//         https.get(`${host}${champions}?api_key=${apiKey}`, (res) => {
//             let body = '';

//             res.on('data', (d) => { body += d; });
//             res.on('end', () => {
//                 let res = JSON.parse(body);

//                 const values = Object.keys(res.data).map(function(key) {
//                     return res.data[key];
//                 });

//                 resolve(values);
//             });
//             res.on('error', (error) => {
//                 reject(error);
//             });
//         });
//     });
// }
