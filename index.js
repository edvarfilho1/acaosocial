var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');

var baseURLIBGEEstado = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
var baseURLIBGEMunicipio = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/';
var baseURLBolsaFamilia = 'http://www.transparencia.gov.br/api-de-dados/bolsa-familia-por-municipio?mesAno=';

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
        session.send("Olá! Caro Funcionário da Ação Social.");
        session.send("Digite 'realizar busca' para iniciar a pesquisa.");
        //session.endDialog();
    }
]);


// Custom recognizer
bot.recognizer({
  recognize: function (context, done) {
        var intent = { score: 0.0 };

        if (context.message.text) {
            switch (context.message.text.toLowerCase()) {
                case "realizar busca":
                    intent = {score: 1.0, intent: 'realizar-busca'}
                    break;
                case 'obrigado':
                    intent = { score: 1.0, intent: 'say-goodbye' };
                    break;
                case 'ok':
                    intent = { score: 1.0, intent: 'say-goodbye'};
            }
        }
        done(null, intent);
    }
});

bot.dialog('say-goodbye', [
    function (session) {
        session.send('Obrigado! Até mais.');
        session.endConversation();
    }
]).triggerAction({
    matches: 'say-goodbye'
});


bot.dialog('realizar-busca', [
    function (session) {
        session.send('Ok. Procurar por dados referentes ao Bolsa Família de um município!');
        builder.Prompts.text(session, 'Informe o estado do Município');
    },
    function (session, results) {
        session.conversationData.estado = results.response, session;
        builder.Prompts.text(session, 'Informe o nome do Município');
    },
    function (session, results) {
        session.conversationData.municipio = results.response;
        builder.Prompts.text(session, 'Informe o mês que deseja realizar a busca');
    },
    function (session, results) {
        session.conversationData.mes = results.response;
        builder.Prompts.text(session, 'Informe o ano que deseja realizar a busca');
    },
    function (session, results) {
        session.conversationData.ano = results.response;
        session.send('Ok. Procurando por valores..');
        getValor(session.conversationData.estado, 
            session.conversationData.municipio,
            session.conversationData.mes,
            session.conversationData.ano, 
            session);
    }
])
    .triggerAction({
    matches: 'realizar-busca',
    confirmPrompt: 'Sua tarefa de procurar dados do município será abandonada. Tem certeza?'
});


function getMes(mes){
    mes = mes.toLowerCase();
    if(mes.localeCompare('01')||mes.localeCompare('janeiro')){
        return '01';
    }
    if(mes.localeCompare('02')||mes.localeCompare('fevereiro')){
        return '02';
    }
    if(mes.localeCompare('03')||mes.localeCompare('março')){
        return '03';
    }
    if(mes.localeCompare('04')||mes.localeCompare('abril')){
        return '04';
    }
    if(mes.localeCompare('05')||mes.localeCompare('maio')){
        return '05';
    }
    if(mes.localeCompare('06')||mes.localeCompare('junho')){
        return '06';
    }
    if(mes.localeCompare('07')||mes.localeCompare('julho')){
        return '07';
    }
    if(mes.localeCompare('08')||mes.localeCompare('agosto')){
        return '08';
    }
    if(mes.localeCompare('09')||mes.localeCompare('setembro')){
        return '01';
    }
    if(mes.localeCompare('10')||mes.localeCompare('outubro')){
        return '10';
    }
    if(mes.localeCompare('11')||mes.localeCompare('novembro')){
        return '11';
    }
    if(mes.localeCompare('12')||mes.localeCompare('dezembro')){
        return '12';
    }
}


function getValor(estado, municipio, mes, ano, session){
    var options = {
        uri: baseURLIBGEEstado
    }
    var callback = function(error, response, body) {
            if (error) {
                console.log('Erro ao enviar mensagens: ', error)
            } else if (response.body.error) {
                console.log('Erro: ', response.body.error)
            } else {
                console.log('Valor Encontrado:')
                console.log(body);
                var results = JSON.parse(body);
                getMunicipio(session, results, estado, municipio, mes, ano);
                session.endDialog();
            }
        }
    request(options,callback); 
}

function getMunicipio(session, results, estado, municipio, mes, ano){
    var idEstado;
    for(var i=0; i<27; i++){
        var sigla = results[i].sigla.toLowerCase();
        var nome = results[i].nome.toLowerCase();
        if((sigla==estado) || (nome==estado)){
            idEstado = results[i].id;
        }
    }
    console.log(idEstado);

    var options = {
        uri: baseURLIBGEMunicipio+idEstado+'/municipios'
    }
    var callback = function(error, response, body) {
            if (error) {
                console.log('Erro ao enviar mensagens: ', error)
            } else if (response.body.error) {
                console.log('Erro: ', response.body.error)
            } else {
                console.log('Valor Encontrado:')
                console.log(body);
                var results = JSON.parse(body);
                getDados(session, results, estado, municipio, mes, ano);
                session.endDialog();
            }
        }
    request(options,callback);
}


function getDados(session, results, estado, municipio, mes, ano){
    mes = getMes(mes);

    var idMunicipio;
    var achou = false;
    var i = 0;
    while(!achou){
        var nome = results[i].nome.toLowerCase();
        if(nome==municipio){
            idMunicipio = results[i].id;
            achou = true;
        }
        else{
            i++;
        }
    }
    console.log(idMunicipio);

    var options = {
        uri:baseURLBolsaFamilia+ano+mes+'&codigoIbge='+idMunicipio+'&pagina=1'
    }
    var callback = function(error, response, body) {
            if (error) {
                console.log('Erro ao enviar mensagens: ', error)
            } else if (response.body.error) {
                console.log('Erro: ', response.body.error)
            } else {
                console.log('Valor Encontrado:')
                console.log(body);
                var results = JSON.parse(body);
                apresentarDados(session, results);
                session.endDialog();
            }
        }
    request(options,callback);

}

function apresentarDados(session, results){
    session.send('Município: '+results[0].municipio.nomeIBGE);
    session.send('Data de Referência: '+results[0].dataReferencia);
    session.send('Valor: R$'+results[0].valor);
    session.send('Quantidade de Beneficiados: '+results[0].quantidadeBeneficiados);
    session.send("Digite 'obrigado' ou 'OK' para encerrar, ou 'realizar busca' para continuar a busca.");
    session.endDialog();
}