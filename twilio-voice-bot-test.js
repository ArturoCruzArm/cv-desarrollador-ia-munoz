/**
 * VOICE BOT - PRUEBA SIMPLE (SIN IA)
 * Para verificar que el webhook funciona correctamente
 */

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const speechResult = event.SpeechResult || '';

  if (!speechResult) {
    // Primera interacción
    const gather = twiml.gather({
      input: 'speech',
      language: 'es-MX',
      timeout: 3,
      action: '/voice-bot',
      method: 'POST'
    });

    gather.say({
      voice: 'Polly.Mia',
      language: 'es-MX'
    },
    'Hola, soy el asistente de voz de Juan Arturo Cruz Armenta. ' +
    'Esta es una prueba simple. Por favor, haz una pregunta sobre su experiencia.');

    twiml.say({
      voice: 'Polly.Mia',
      language: 'es-MX'
    }, 'No recibí tu pregunta. Gracias por llamar.');
    twiml.hangup();

  } else {
    // Respuesta simple
    twiml.say({
      voice: 'Polly.Mia',
      language: 'es-MX'
    }, 'Escuché que dijiste: ' + speechResult + '. Juan tiene 5 años de experiencia en desarrollo y chatbots. Gracias por llamar.');
    twiml.hangup();
  }

  callback(null, twiml);
};
