const VOICE_ID = "EQx6HGDYjkDpcli6vorJ"; // Lizzie - Cockney

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'No ElevenLabs key' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Bad JSON' }) }; }

  const { text } = body;
  if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'No text' }) };

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?optimize_streaming_latency=4&output_format=mp3_22050_32`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_API_KEY },
        body: JSON.stringify({
          text: text.slice(0, 300),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.4, similarity_boost: 0.7, style: 0.4, use_speaker_boost: false },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: response.status, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err }) };
    }

    const buf = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ audio: Buffer.from(buf).toString('base64') }),
    };
  } catch(err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
