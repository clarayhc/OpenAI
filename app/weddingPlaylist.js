import { promptGPT } from "../shared/openai.ts"
import { ask, say } from "../shared/cli.ts"
import { getGenre, getTrackRecommendation } from "../shared/spotify.ts"
import { fuzzyFind, millisToMinutesAndSeconds } from "./utils.js"
/**
 * @typedef {import('../types/spotifyTypes').RecommendationRequest} RecommendationRequest
 */
// Initialize an empty array for storing weddings

say("Welcome to your AI wedding planner.")
const response = await ask(
  "Type create to add songs to the playlist, type view to view existing playlist"
)

if (response.toLowerCase() === "create") await createWedding()
else if (response.toLowerCase() === "view") await getPlaylist()

async function getPlaylist() {
  const playlist = await fetchPlaylist()
  const songList = playlist['playlist']
  songList.forEach((song, i) => {
    console.log(`${i+1}. ${song['name']} by ${song['artists'][0]['name']} : ${millisToMinutesAndSeconds(song['duration'])} `)
  })
}
async function createWedding() {
  const availableGenres = await getGenre()
  
  const theme = await ask(
    "What theme will your wedding have? (ex) fun, serious, casual, etc."
  )
  const genreResponse = await promptGPT(
    `Give a list of 5 recommended Spotify music genre based on the theme of ${theme}. Response in JSON format and in lowercase:
    {
      genres: []string
    }`,
    { temperature: 0.8, response_format: { type: "json_object" } }
  )
  const genres = JSON.parse(genreResponse)['genres']
  let spotifyGenres = []
  
  genres.forEach((genre) => {
    const found = fuzzyFind(availableGenres, genre)
    if (found && !spotifyGenres.find(x => x === found)) {
      spotifyGenres.push(found)
    }
  })

  const type = await ask(
    `Here are the recommended genres ${spotifyGenres}. Type y to continue.`
  )

  if (type !== "y") {
    return
  }

  const lyric = await ask("Would you like the music to have lyrics?")

  const response = await promptGPT(
    `Calculate the following factors to make a track recommendation request to Spotify API based on these user preferences
    'Theme of music': '${theme}', 'Type of music': '${type}', 'Lyrics Enabled': '${lyric}'. Limit to 10 tracks. 
    Calculate the factors for the following JSON fields. 
    {
      limit: number
      min_acousticness?: number
      max_acousticness?: number
      target_acousticness?: number
      min_danceability?: number
      max_danceability?: number
      target_danceability?: number
      min_energy?: number
      max_energy?: number
      target_energy?: number
      min_intrumentalness?: number
      max_instrumentalness?: number
      target_instrumentalness?: number
      min_key?: number
      max_key?: number
      target_key?: number
      min_speechiness?: number
      max_speechiness?: number
      target_speechiness?: number
      min_tempo?: number
      max_tempo?: number
      target_tempo?: number
    }`,
    { temperature: 0.8, response_format: { type: "json_object" } }
  )
  const request = JSON.parse(response)
  const recs = await fetchRecommendation(request, spotifyGenres)
  await savePlaylist(recs)
}

async function savePlaylist(playlist) {
  const fetchedPlaylist = await fetchPlaylist()
  fetchedPlaylist['playlist'].push(...playlist)
  await Deno.writeTextFile(
    `./playlist.json`,
    JSON.stringify(fetchedPlaylist, null, 2)
  )
}

async function fetchPlaylist() {
  const text = await Deno.readTextFile(`./playlist.json`)
  const playlist = JSON.parse(text)
  return playlist
}

/**
 * @param {RecommendationRequest} request
 * @param {string[]} genres
 */
async function fetchRecommendation(request, genres) {
  request.seed_genres = genres
  const response = await getTrackRecommendation(request)
  const tracks = response['tracks']
  const processedTracks = tracks.map((track) => {
    const artists = track['artists'].map((artist) => {
      return {
        id: artist['id'],
        name: artist['name'],
        url: artist['external_urls']['spotify']
      }
    })
    return {
      id: track['id'],
      name: track['name'],
      artists: artists,
      popularity: track['popularity'],
      url: track['external_urls']['spotify'],
      duration: track['duration_ms']
    }
  })
  return processedTracks
}
