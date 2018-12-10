var restify = require('restify');
var builder = require('botbuilder');
//var request = require('request');

/*var baseURL = 'https://developers.zomato.com/api/v2.1/';
var apiKey = 'CHAVE_AQUI'; //Zomato key

var catergories = null;
var cuisines = null;

getCategories();

getCuisines(76);

*/
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s escutando %s', server.name, server.url); 
});


// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "c675792e-5d56-4dae-9ce7-6116305edf43",
    appPassword: "kmKYUPP7217!rmcthNK2@]:"
});

// Listen for messages from users 
server.post('/acaosocial', connector.listen());

// This is a dinner reservation bot that uses multiple dialogs to prompt users for input.
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Olá! Faminto? Procurando por um restaurante?");
        //session.send("Diga 'buscar restaurante' para iniciar a pesquisa.");
        //session.endDialog();
    }
]);