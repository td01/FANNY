// D-ID Streaming API proxy
const DID_API = 'https://api.d-id.com';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const DID_KEY = process.env.DID_API_KEY;
  if (!DID_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'No D-ID key' }) };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: '{"error":"Bad JSON"}' }; }

  const { action, streamId, sessionId, offer, iceServers, text, voiceId } = body;

  try {
    let url, method = 'POST', payload;

    switch(action) {
      case 'create':
        url = `${DID_API}/talks/streams`;
        payload = {
          presenter_id: body.presenterId,
          driver_id: 'uM00QMww2Re',
          face: {
            top_left: [0, 0],
            size: 512,
          },
          config: { stitch: true, fluent: true, auto_match: true },
        };
        break;

      case 'sdp':
        url = `${DID_API}/talks/streams/${streamId}/sdp`;
        payload = { answer: offer, session_id: sessionId };
        break;

      case 'ice':
        url = `${DID_API}/talks/streams/${streamId}/ice`;
        payload = { candidate: body.candidate, sdpMid: body.sdpMid, sdpMLineIndex: body.sdpMLineIndex, session_id: sessionId };
        break;

      case 'talk':
        url = `${DID_API}/talks/streams/${streamId}`;
        payload = {
          script: {
            type: 'text',
            input: text,
            provider: {
              type: 'elevenlabs',
              voice_id: voiceId || 'EQx6HGDYjkDpcli6vorJ',
              model_id: 'eleven_turbo_v2_5',
              voice_config: { stability: 0.4, similarity_boost: 0.75, style: 0.45 }
            }
          },
          session_id: sessionId,
          config: { fluent: true, pad_audio: 0 },
        };
        break;

      case 'destroy':
        url = `${DID_API}/talks/streams/${streamId}`;
        method = 'DELETE';
        payload = { session_id: sessionId };
        break;

      default:
        return { statusCode: 400, body: '{"error":"Unknown action"}' };
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${DID_KEY}`,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };

  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
