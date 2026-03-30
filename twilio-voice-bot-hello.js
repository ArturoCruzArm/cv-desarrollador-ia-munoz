exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  twiml.say({
    voice: 'Polly.Mia',
    language: 'es-MX'
  }, 'Hola, esta es una prueba simple del voice bot de Juan Arturo Cruz Armenta. Si escuchas este mensaje, el webhook está funcionando correctamente.');

  twiml.hangup();

  callback(null, twiml);
};
