/**
 * VOICE BOT V3 - TWILIO + GEMINI AI 2.5 (OPTIMIZADO)
 * Desarrollador: Juan Arturo Cruz Armenta
 * Para: MUÑOZ C Y ASOCIADOS
 *
 * Versión optimizada sin warnings de Twilio
 */

const GEMINI_API_KEY = 'AIzaSyDChkd9s_ZrZWrNViv0PMbKkAhaur1BOnQ';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

exports.handler = async function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
  const speechResult = event.SpeechResult || '';

  // Función para obtener respuesta de Gemini AI
  async function getGeminiResponse(userQuestion) {
    if (!userQuestion) {
      return 'No te escuché bien. Por favor repite tu pregunta.';
    }

    try {
      const systemPrompt = `Eres el asistente de voz de Juan Arturo Cruz Armenta, candidato para Desarrollador IA en MUÑOZ C Y ASOCIADOS, León, Guanajuato.

INFORMACIÓN DEL CANDIDATO:
- Experiencia: 5 años total (4 años Contact Center Kodiak Hub + 1 año Full Stack Developer)
- Chatbots: 3+ años con Dialogflow, NLP, IA conversacional
- Educación: Ingeniero en Sistemas Computacionales - Especialidad IA (UVEG 2024-2025)
- Habilidades: Python, JavaScript, Java, Ruby, HTML, CSS, IA, ML, NLP
- Cloud: AWS, Google Cloud
- Contact Center: 4 años experiencia, conocimiento profundo del sector
- Telefonía: Twilio, Asterisk, FreePBX, VoIP
- Ubicación: León, Guanajuato, México
- Disponibilidad: Inmediata
- Contacto: 477 920 3776 / juanarturocruzarmenta@outlook.com

INSTRUCCIONES IMPORTANTES:
- Responde en español de forma MUY BREVE (máximo 2-3 oraciones)
- Tono profesional pero amigable
- Enfócate en cómo Juan cumple los requisitos del puesto
- Si no sabes algo, sugiere contactar directamente a Juan
- NO uses markdown, emojis ni formato especial
- Respuestas directas y concisas para voz telefónica`;

      const axios = require('axios');
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nPregunta: ${userQuestion}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            topP: 0.95,
            topK: 40
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000
        }
      );

      if (response.data.candidates && response.data.candidates[0]) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response from Gemini');
      }

    } catch (error) {
      console.error('Error con Gemini AI:', error.message);
      // Fallback inteligente
      return 'Juan tiene 5 años de experiencia, especialidad en IA, 3 años con chatbots y dominio de Python y JavaScript. Cumple todos los requisitos del puesto. ¿Qué aspecto específico te interesa?';
    }
  }

  // FLUJO DE LA LLAMADA
  if (!speechResult) {
    // Primera interacción: Bienvenida
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
    'Hola, bienvenido al asistente de voz de Juan Arturo Cruz Armenta, ' +
    'candidato para Desarrollador de Inteligencia Artificial en MUÑOZ C Y ASOCIADOS. ' +
    'Puedes preguntarme sobre su experiencia, habilidades o proyectos. ' +
    'Por favor, haz tu pregunta ahora.');

    twiml.say({
      voice: 'Polly.Mia',
      language: 'es-MX'
    }, 'No recibí tu pregunta. Gracias por llamar.');
    twiml.hangup();

  } else {
    // Responder con Gemini AI
    try {
      const botResponse = await getGeminiResponse(speechResult);

      twiml.say({
        voice: 'Polly.Mia',
        language: 'es-MX'
      }, botResponse);

      // Preguntar si tiene más dudas
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
      }, '¿Tienes alguna otra pregunta?');

      twiml.say({
        voice: 'Polly.Mia',
        language: 'es-MX'
      }, 'Gracias por tu tiempo. Para más información contacta a Juan directamente. Hasta luego.');
      twiml.hangup();

    } catch (error) {
      console.error('Error en voice bot:', error);
      twiml.say({
        voice: 'Polly.Mia',
        language: 'es-MX'
      }, 'Disculpa, tuve un problema. Por favor contacta a Juan al 477 920 3776. Gracias.');
      twiml.hangup();
    }
  }

  callback(null, twiml);
};
