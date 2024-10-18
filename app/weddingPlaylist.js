import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/select.ts";
import { promptGPT } from "../shared/openai.ts";
import { ask, say } from "../shared/cli.ts";
import { getGenre, getTrackRecommendation } from "../shared/spotify.ts";
import { fuzzyFind, millisToMinutesAndSeconds } from "./utils.js";

/**
 * @typedef {import('../types/spotifyTypes').RecommendationRequest} RecommendationRequest
 */

say("Welcome to your AI wedding planner.");
const response = await ask(
  "Type create to add songs to the playlist, type view to view existing playlist"
);

if (response.toLowerCase() === "create") await createWedding();
else if (response.toLowerCase() === "view") await getPlaylist();

async function getPlaylist() {
  const playlist = await fetchPlaylist();
  const songList = playlist['playlist'];
  songList.forEach((song, i) => {
    console.log(`${i+1}. ${song['name']} by ${song['artists'][0]['name']} : ${millisToMinutesAndSeconds(song['duration'])} `);
  });
}

async function createWedding() {
  const availableGenres = await getGenre();

  // Using Select for theme
  const theme = await Select.prompt({
    message: "Choose your wedding theme",
    options: ["fun", "serious", "casual", "romantic", "luxurious"],
  });

  console.log("You chose theme:", theme);

  // Using Select for genre
  const genre = await Select.prompt({
    message: "Choose a genre for your wedding music",
    options: availableGenres,
  });

  console.log("You chose genre:", genre);

  // Using Select for lyrics
  const lyric = await Select.prompt({
    message: "Do you want the music to have lyrics?",
    options: ["Yes", "No"],
  });

  console.log("Lyrics preference:", lyric);

  // Prompt GPT for music track recommendations
  const genreResponse = await promptGPT(
    `Calculate the following factors to make a track recommendation request to Spotify API based on these user preferences:
    'Theme of music': '${theme}', 'Genre': '${genre}', 'Lyrics Enabled': '${lyric}'. Limit to 10 tracks.`,
    { temperature: 0.8, response_format: { type: "json_object" } }
  );

  const request = JSON.parse(genreResponse);
  const recs = await fetchRecommendation(request, [genre]);
  await savePlaylist(recs);
}

async function savePlaylist(playlist) {
  const fetchedPlaylist = await fetchPlaylist();
  fetchedPlaylist['playlist'].push(...playlist);
  await Deno.writeTextFile(
    `./playlist.json`,
    JSON.stringify(fetchedPlaylist, null, 2)
  );
}

async function fetchPlaylist() {
  const text = await Deno.readTextFile(`./playlist.json`);
  const playlist = JSON.parse(text);
  return playlist;
}

/**
 * @param {RecommendationRequest} request
 * @param {string[]} genres
 */
async function fetchRecommendation(request, genres) {
  request.seed_genres = genres;
  const response = await getTrackRecommendation(request);
  const tracks = response['tracks'];
  const processedTracks = tracks.map((track) => {
    const artists = track['artists'].map((artist) => {
      return {
        id: artist['id'],
        name: artist['name'],
        url: artist['external_urls']['spotify'],
      };
    });
    return {
      id: track['id'],
      name: track['name'],
      artists: artists,
      popularity: track['popularity'],
      url: track['external_urls']['spotify'],
      duration: track['duration_ms'],
    };
  });
  return processedTracks;
}
