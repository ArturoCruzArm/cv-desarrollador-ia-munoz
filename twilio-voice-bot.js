/**
 * VOICE BOT TELEFÓNICO CON TWILIO + GEMINI AI
 * Desarrollador: Juan Arturo Cruz Armenta
 * Para: MUÑOZ C Y ASOCIADOS
 *
 * Voice bot con IA real usando Google Gemini API
 *
 * DEPLOYMENT:
 * 1. Ir a Twilio Console > Functions & Assets > Services
 * 2. Crear nuevo Service "voice-bot-ia"
 * 3. Agregar este archivo como Function
 * 4. Deploy
 * 5. Configurar el webhook en el número telefónico
 */

const GEMINI_API_KEY = 'AIzaSyDChkd9s_ZrZWrNViv0PMbKkAhaur1BOnQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

exports.handler = async function(context, event, callback) {
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

  // Función para obtener respuesta de Gemini AI
  async function getBotResponse(userInput) {
    if (!userInput) {
      return 'No te escuché bien. Por favor repite tu pregunta.';
    }

    try {
      const systemPrompt = `Eres el asistente virtual de voz de Juan Arturo Cruz Armenta, candidato para Desarrollador IA en MUÑOZ C Y ASOCIADOS en León, Guanajuato.

INFORMACIÓN:
- Experiencia: 5 años (4 años en Contact Center Kodiak Hub, 1 año Full Stack)
- Chatbots: 3+ años con Dialogflow, NLP, IA conversacional
- Educación: Ingeniero en Sistemas con especialidad IA (UVEG 2024-2025)
- Skills: Python, JavaScript, Java, ML, NLP, AWS, Google Cloud
- Teléfono: 477 920 3776
- Email: juanarturocruzarmenta@outlook.com
- Disponibilidad: Inmediata

INSTRUCCIONES:
- Responde en español de forma BREVE (máximo 2 oraciones)
- Profesional pero amigable
- Enfoca en cómo Juan cumple requisitos
- Si no sabes, indica contactar directamente`;

      const axios = require('axios');
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nPregunta: ${userInput}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.candidates && response.data.candidates[0]) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response from Gemini');
      }

    } catch (error) {
      console.error('Error con Gemini:', error);
      // Fallback
      return 'Juan tiene 5 años de experiencia, 3 años con chatbots, especialidad en IA, y dominio de Python y JavaScript. ¿Qué aspecto te interesa más?';
    }
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
    // --- Interacciones Siguientes: Responder con Gemini AI ---
    try {
      // Primero, damos la respuesta usando Gemini AI
      const botResponse = await getBotResponse(speechResult);
      twiml.say({
        voice: 'Polly.Mia',
        language: 'es-MX'
      }, botResponse);

      // Ahora, creamos un nuevo gather para esperar la siguiente pregunta.
      const gather = twiml.gather({
        input: 'speech',
        language: 'es-MX',
        speechTimeout: '4',
        speechModel: 'phone_call',
        enhanced: true,
        action: '/voice-bot',
        method: 'POST'
      });

      gather.say({
        voice: 'Polly.Mia',
        language: 'es-MX'
      }, '¿Tienes alguna otra pregunta?');

      // Si el usuario no hace otra pregunta, nos despedimos.
      twiml.say('Gracias por tu tiempo. ¡Hasta luego!');
      twiml.hangup();

    } catch (error) {
      console.error('Error en voice bot:', error);
      twiml.say({
        voice: 'Polly.Mia',
        language: 'es-MX'
      }, 'Disculpa, tuve un problema al procesar tu pregunta. Por favor intenta de nuevo o contacta directamente a Juan al 477 920 3776.');
      twiml.hangup();
    }
  }

  // Retornar la respuesta TwiML
  callback(null, twiml);
};
