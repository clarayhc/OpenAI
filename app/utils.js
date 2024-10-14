function levenshteinDistance(a, b) {
  const matrix = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Fuzzy find function
export function fuzzyFind(arr, searchTerm, key = null, threshold = 0.1) {
  const normalizedSearchTerm = searchTerm.toLowerCase()

  return arr.find((item) => {
    const compareString = key ? item[key].toLowerCase() : item.toLowerCase()
    const distance = levenshteinDistance(normalizedSearchTerm, compareString)
    const similarity =
      1 - distance / Math.max(normalizedSearchTerm.length, compareString.length)
    return similarity >= threshold
  })
}

export function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
}
