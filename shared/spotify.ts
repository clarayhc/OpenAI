import { getEnvVariable } from "./util.ts"

type RecommendationRequest = {
  limit?: number
  seed_genres: string[]
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
}

// 
const initSpotify = async () => {
  const client_id = getEnvVariable("SPOTIFY_ID")
  if (!client_id) throw new Error("SPOTIFY_ID not found.")
  const client_secret = getEnvVariable("SPOTIFY_KEY")
  if (!client_secret) throw new Error("SPOTIFY_KEY not found.")
  const authOptions = {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  }
  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions
  )
  const responseObj = await response.json()
  return responseObj["access_token"]
}

export function encodeRecommendationRequest(
  request: RecommendationRequest
): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(request)) {
    if (value !== undefined) {
      params.append(key, value.toString())
    }
  }
  
  return params.toString()
}

export async function getGenre() {
  const token = await initSpotify()
  const url = "https://api.spotify.com/v1/recommendations/available-genre-seeds"
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data['genres']
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    throw error
  }
}

// https://api.spotify.com/v1/recommendations
export async function getTrackRecommendation(request: RecommendationRequest) {
  const token = await initSpotify()
  const baseUrl = "https://api.spotify.com/v1/recommendations"
  const queryString = encodeRecommendationRequest(request)
  const fullUrl = `${baseUrl}?${queryString}`
  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    throw error
  }
}
