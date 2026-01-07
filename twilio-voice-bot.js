/**
 * VOICE BOT TELEFÓNICO CON TWILIO + IA
 * Desarrollador: Juan Arturo Cruz Armenta
 * Para: MUÑOZ C Y ASOCIADOS
 *
 * Este Twilio Function maneja llamadas telefónicas entrantes
 * con procesamiento de lenguaje natural e inteligencia artificial.
 *
 * DEPLOYMENT:
 * 1. Ir a Twilio Console > Functions & Assets > Services
 * 2. Crear nuevo Service "voice-bot-ia"
 * 3. Agregar este archivo como Function
 * 4. Deploy
 * 5. Configurar el webhook en el número telefónico
 */

exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  // Obtener parámetros de la llamada
  const speechResult = event.SpeechResult || '';
  const confidence = event.Confidence || 0;
  const callStatus = event.CallStatus || 'initiated';

  // Base de conocimientos del Voice Bot (igual que en el CV web)
  const knowledgeBase = {
    saludo: {
      keywords: ['hola', 'buenos días', 'buenas tardes', 'qué tal'],
      response: 'Hola, soy el asistente virtual de Juan Arturo Cruz Armenta. Puedo responder preguntas sobre su experiencia, habilidades técnicas, educación, o proyectos. ¿Qué te gustaría saber?'
    },
    experiencia: {
      keywords: ['experiencia', 'trabajo', 'años', 'laboral', 'empleos'],
      response: 'Juan tiene 5 años de experiencia profesional. 4 años en Kodiak Hub como Analista de Soporte Técnico en Contact Center, y 1 año como Desarrollador Full Stack. Ha trabajado con chatbots, IA, y sistemas de contact center.'
    },
    chatbots: {
      keywords: ['chatbot', 'bot', 'conversacional', 'dialogflow', 'rasa'],
      response: 'Juan tiene más de 3 años trabajando con chatbots. Ha desarrollado bots con Dialogflow, implementado NLP básico en JavaScript, y trabajado con inteligencia artificial conversacional. Este mismo voice bot es un ejemplo de sus habilidades.'
    },
    habilidades: {
      keywords: ['habilidades', 'tecnologías', 'lenguajes', 'programación', 'skills'],
      response: 'Juan domina HTML, CSS, JavaScript, Python, Java, y Ruby. Tiene experiencia en IA, Machine Learning, NLP, frameworks de chatbot como Dialogflow y Rasa, y plataformas cloud como AWS y Google Cloud.'
    },
    educacion: {
      keywords: ['educación', 'estudios', 'universidad', 'título', 'certificado'],
      response: 'Juan es Ingeniero en Sistemas Computacionales con especialidad en Inteligencia Artificial por la Universidad Virtual del Estado de Guanajuato. Revalidó sus estudios en 2024-2025 y su certificado está en proceso de emisión.'
    },
    contactCenter: {
      keywords: ['contact center', 'call center', 'atención', 'cliente', 'soporte'],
      response: 'Juan trabajó 4 años en Kodiak Hub, un contact center. Tiene experiencia en soporte técnico, atención a clientes, y optimización de procesos. Conoce las necesidades y retos de los contact centers.'
    },
    telefonia: {
      keywords: ['twilio', 'telefonía', 'llamadas', 'voz', 'voice', 'asterisk'],
      response: 'Juan tiene experiencia con Twilio para voice bots telefónicos, como este que estás usando ahora. También conoce Asterisk, FreePBX, y sistemas VoIP. Puede integrar IA con sistemas telefónicos.'
    },
    ia: {
      keywords: ['inteligencia artificial', 'machine learning', 'ia', 'ml', 'nlp', 'pln'],
      response: 'Juan se especializa en Inteligencia Artificial. Tiene experiencia en Machine Learning, Procesamiento de Lenguaje Natural, algoritmos de IA, y desarrollo de modelos predictivos. Su especialidad universitaria es IA.'
    },
    ubicacion: {
      keywords: ['ubicación', 'dónde', 'león', 'guanajuato', 'ciudad'],
      response: 'Juan está ubicado en León, Guanajuato, México. Tiene disponibilidad inmediata y puede trabajar presencial u home office.'
    },
    contacto: {
      keywords: ['contacto', 'teléfono', 'email', 'correo', 'llamar', 'escribir'],
      response: 'Puedes contactar a Juan en el correo juanarturocruzarmenta@outlook.com o al teléfono 477 920 3776. También puedes ver su CV interactivo en desarrollador-ia.invitados.org'
    },
    despedida: {
      keywords: ['adiós', 'gracias', 'hasta luego', 'bye', 'chao'],
      response: 'Gracias por llamar. Si necesitas más información, visita el CV interactivo en desarrollador-ia.invitados.org o contacta a Juan directamente. ¡Que tengas un excelente día!'
    }
  };

  // Función para encontrar la mejor respuesta usando NLP
  function getBotResponse(userInput) {
    if (!userInput) {
      return 'No te escuché bien. Por favor repite tu pregunta.';
    }

    const input = userInput.toLowerCase();
    let bestMatch = null;
    let maxScore = 0;

    // Buscar coincidencias en la base de conocimientos
    for (const [topic, data] of Object.entries(knowledgeBase)) {
      let score = 0;
      data.keywords.forEach(keyword => {
        if (input.includes(keyword)) {
          score += keyword.length; // Keywords más largos = mejor match
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = data.response;
      }
    }

    // Si no hay match, respuesta genérica
    if (!bestMatch) {
      return 'Interesante pregunta. Puedo hablarte sobre la experiencia de Juan, sus habilidades técnicas, educación, proyectos con chatbots, IA, o su experiencia en contact center. ¿Sobre qué te gustaría saber?';
    }

    return bestMatch;
  }

  // Manejo del flujo de la llamada
  if (!speechResult) {
    // --- Primera Interacción: Bienvenida ---
    const gather = twiml.gather({
      input: 'speech',
      language: 'es-MX',
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      enhanced: true,
      action: '/voice-bot', // Llama a esta misma función con el resultado
      method: 'POST'
    });

    gather.say({
        voice: 'Polly.Mia',
        language: 'es-MX'
      },
      'Hola, bienvenido al voice bot de Juan Arturo Cruz Armenta, candidato para Desarrollador de Inteligencia Artificial en MUÑOZ C Y ASOCIADOS. ' +
      'Este es un asistente con inteligencia artificial que puede responder preguntas sobre la experiencia, habilidades, y proyectos de Juan. ' +
      'Por favor, haz tu pregunta ahora.'
    );

    // Si el usuario no dice nada, la llamada continúa aquí después del timeout del gather.
    twiml.say('No recibí tu pregunta. Gracias por llamar. Hasta luego.');
    twiml.hangup();

  } else {
    // --- Interacciones Siguientes: Responder y continuar ---
    // Primero, damos la respuesta a la pregunta anterior.
    const botResponse = getBotResponse(speechResult);
    twiml.say({
      voice: 'Polly.Mia',
      language: 'es-MX'
    }, botResponse);

    // Ahora, creamos un nuevo gather para esperar la siguiente pregunta.
    const gather = twiml.gather({
      input: 'speech',
      language: 'es-MX',
      speechTimeout: '4', // Un timeout más corto para continuar la conversación.
      speechModel: 'phone_call',
      enhanced: true,
      action: '/voice-bot', // Vuelve a llamar a la función para un bucle.
      method: 'POST'
    });

    gather.say({
      voice: 'Polly.Mia',
      language: 'es-MX'
    }, '¿Tienes alguna otra pregunta?');

    // Si el usuario no hace otra pregunta, nos despedimos.
    twiml.say('Gracias por tu tiempo. ¡Hasta luego!');
    twiml.hangup();
  }

  // Retornar la respuesta TwiML
  callback(null, twiml);
};
