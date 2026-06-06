const DID_API = 'https://api.d-id.com';
const AGENT_ID = 'v2_agt_DVc2eLPi';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const DID_KEY = process.env.DID_API_KEY;
  if (!DID_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'No D-ID key' }) };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: '{"error":"Bad JSON"}' }; }

  const { action, streamId, sessionId, offer, text } = body;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${DID_KEY}`,
  };

  try {
    let url, method = 'POST', payload;

    switch(action) {

      // Get a client key for the frontend SDK
      case 'client-key':
        url = `${DID_API}/agents/client-key`;
        payload = { allowed_domains: ['https://fannywc2.netlify.app', 'http://localhost:3000'] };
        break;

      // Create agent stream (returns offer + ICE servers)
      case 'create':
        url = `${DID_API}/agents/${AGENT_ID}/streams`;
        payload = {};
        break;

      // SDP answer
      case 'sdp':
        url = `${DID_API}/agents/${AGENT_ID}/streams/${streamId}/sdp`;
        payload = { answer: offer, session_id: sessionId };
        break;

      // ICE candidate
      case 'ice':
        url = `${DID_API}/agents/${AGENT_ID}/streams/${streamId}/ice`;
        payload = {
          candidate: body.candidate,
          sdpMid: body.sdpMid,
          sdpMLineIndex: body.sdpMLineIndex,
          session_id: sessionId
        };
        break;

      // Send text — uses streams speak endpoint (bypasses D-ID LLM, uses our text)
      case 'talk':
        url = `${DID_API}/agents/${AGENT_ID}/streams/${streamId}`;
        payload = {
          script: {
            type: 'text',
            input: text,
        provider: {
              type: 'microsoft',
              voice_id: 'en-GB-SoniaNeural',
            }
            }
          },
          session_id: sessionId,
          config: { fluent: true, pad_audio: 0 },
        };
        break;

      case 'destroy':
        url = `${DID_API}/agents/${AGENT_ID}/streams/${streamId}`;
        method = 'DELETE';
        payload = { session_id: sessionId };
        break;

      default:
        return { statusCode: 400, body: '{"error":"Unknown action"}' };
    }

    const res = await fetch(url, {
      method,
      headers,
      body: payload && Object.keys(payload).length > 0 ? JSON.stringify(payload) : undefined,
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
