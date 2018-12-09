var	restify	=	require('restify'); 
var	builder	=	require('botbuilder');

//	Lets	setup	the	Restify	Server 
var	server	=	restify.createServer(); 
server.listen(process.env.port	||	process.env.PORT	||	3978,	function	()	{
	console.log('%s	listening	to	%s',	server.name,	server.url);	
});

//	Create	chat	connector	for	communicating	with	the	Bot	Framework	Service 
var	connector	=	new	builder.ChatConnector({
	appId: "c675792e-5d56-4dae-9ce7-6116305edf43",				
	appPassword: "kmKYUPP7217!rmcthNK2@]:"
});

//	Listen	for	messages	from	users	
server.post('/acaosocial',	connector.listen());

//	Echo	their	message	back..	just	parrotting! 
var	bot	=	new	builder.UniversalBot(connector,	function	(session)	{
	session.send("You	said:	%s",	session.message.text); 
});