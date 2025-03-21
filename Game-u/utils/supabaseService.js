import supabase from "./supabaseClient"

// Fetch all spelling words from Supabase
export const fetchSpellingWords = async () => {
  try {
    const { data, error } = await supabase.from("spelling_words").select("*")

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching spelling words:", error)
    throw error
  }
}

// Get words by difficulty
export const getWordsByDifficulty = async (difficulty) => {
  try {
    const { data, error } = await supabase.from("spelling_words").select("*").eq("difficulty", difficulty)

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching ${difficulty} words:`, error)
    throw error
  }
}

// Get a random set of words
export const getRandomWords = async (count = 10) => {
  try {
    // First get all words
    const { data, error } = await supabase.from("spelling_words").select("*")

    if (error) throw error

    // Shuffle and limit
    const shuffled = [...data].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, data.length))
  } catch (error) {
    console.error("Error getting random words:", error)
    throw error
  }
}

// Upload an image to Supabase Storage
export const uploadImage = async (file, fileName) => {
  try {
    // Convert URI to Blob
    const response = await fetch(file.uri)
    const blob = await response.blob()

    const { data, error } = await supabase.storage.from("spelling_images").upload(`images/${fileName}`, blob, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage.from("spelling_images").getPublicUrl(`images/${fileName}`)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Upload an audio file to Supabase Storage
export const uploadAudio = async (file, fileName) => {
  try {
    // Convert URI to Blob
    const response = await fetch(file.uri)
    const blob = await response.blob()

    const { data, error } = await supabase.storage.from("spelling_audio").upload(`audio/${fileName}`, blob, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage.from("spelling_audio").getPublicUrl(`audio/${fileName}`)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading audio:", error)
    throw error
  }
}

// Add a new word to the spelling_words table
export const addWord = async (wordData) => {
  try {
    const { data, error } = await supabase.from("spelling_words").insert([wordData]).select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Error adding word:", error)
    throw error
  }
}

// Update user score in Supabase
export const updateUserScore = async (userId, points) => {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase.from("users").select("*").eq("id", userId).single()

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from("users")
        .update({
          score: existingUser.score + points,
          last_played: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error
    } else {
      // Create new user
      const { error } = await supabase.from("users").insert([
        {
          id: userId,
          score: points,
          last_played: new Date().toISOString(),
        },
      ])

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error("Error updating user score:", error)
    return false
  }
}

// Get user's game progress
export const getUserProgress = async (userId) => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  } catch (error) {
    console.error("Error getting user progress:", error)
    return null
  }
}

// Save game session data
export const saveGameSession = async (userId, sessionData) => {
  try {
    const { error } = await supabase.from("sessions").insert([
      {
        user_id: userId,
        ...sessionData,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error saving game session:", error)
    return false
  }
}

