'use strict';

process.env.DEBUG = 'actions-on-google:*';
const DialogflowApp = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const fetch = require('node-fetch');

// const host = 'https://na1.api.riotgames.com';
// const champions = '/lol/static-data/v3/champions';
// const apiKey = 'RGAPI-8105d3d2-3655-41ec-9845-387c82a486d5';
const config = require('./config.json');

const actions = {
    WELCOME: 'input.welcome',
    DEFAULT: 'default',
    GET_CHAMPION: 'get-champion',
    GET_RANDOM_CHAMPION: 'get-random-champion'
};

const parameters = {

};

const contexts = {

};

function LeagueInfoAssistant(request, response) {
    const app = new DialogflowApp({ request, response });
    const actionHandlers = {};
    actionHandlers[actions.WELCOME] = welcomeResponse;
    actionHandlers[actions.DEFAULT] = defaultResponse;
    actionHandlers[actions.GET_CHAMPION] = getChampion;
    actionHandlers[actions.GET_RANDOM_CHAMPION] = getRandomChampion;
    const { action, parameters, contexts } = request.body.result;

    if (!actionHandlers[action]) {
        action = 'default';
    }

    actionHandlers[action]();

    function welcomeResponse() {
        sendResponse('Hello, Welcome to my Dialogflow agent!');
    }

    function defaultResponse() {
        sendResponse({
            speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!',
            text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)'
        });
    }

    function getChampion() {
        sendResponse({
            speech: 'fvlsdbfs',
            text: 'fvlsdbfs'
        });
    }

    function getRandomChampion() {
        getChampionsFromRiot()
            .then(champions => {
                const randomIndex = Math.floor(Math.random() * champions.length);
                sendResponse(champions[randomIndex].name);
            })
            .catch(err => {
                console.error(err);
                sendResponse('Sorry, something went wrong. Try again in a bit.');
            });
    }

    function sendResponse(responseToUser) {
        let responseJson = {};

        if (typeof responseToUser === 'string') {
            responseJson.speech = responseToUser;
            responseJson.displayText = responseToUser;
        } else {
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;
            responseJson.data = responseToUser.data;
            responseJson.contextOut = responseToUser.outputContexts;
        }

        console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
        response.json(responseJson);
    }
}

function getChampionsFromRiot() { 
    console.log(`Sending request: ${config.host}${config.champions}?api_key=${config.apiKey}`);
    return fetch(`${config.host}${config.champions}?api_key=${config.apiKey}`)
        .then(res => res.json())
        .then(res => Object.keys(res.data).map((key) => res.data[key]));
}

exports.leagueInfo = functions.https.onRequest(LeagueInfoAssistant);
