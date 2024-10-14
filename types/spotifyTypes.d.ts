export type RecommendationRequest = {
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
