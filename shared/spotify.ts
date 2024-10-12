import { getEnvVariable } from "./util";

const client_id = getEnvVariable("SPOTIFY_ID");
if (!client_id) throw new Error("SPOTIFY_ID not found.");
const client_secret = getEnvVariable('SPOTIFY_KEY');
if (!client_secret) throw new Error("SPOTIFY_KEY not found.");

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + `${client_id}:${client_secret}`
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};
fetch('https://accounts.spotify.com/api/token', {
    method: "POST",
    body: JSON.stringify({
      userId: 1,
      title: "Fix my bugs",
      completed: false
    }),
    headers: {
        'Authorization': 'Basic ' + `${client_id}:${client_secret}`
      },
    
  });
request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    var token = body.access_token;
  }
});