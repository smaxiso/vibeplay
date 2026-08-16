const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors()) // Bypass CORS!

const { Innertube, UniversalCache } = require('youtubei.js')

let ytPromise = Innertube.create({ cache: new UniversalCache(false) })
  .then(instance => {
    console.log("InnerTube Initialized successfully")
    return instance
  })
  .catch(error => {
    console.error("Failed to initialize InnerTube:", error)
    throw error
  })

const cache = new Map() // Stores the playlist data
const pendingRequests = new Map() // Stores ongoing fetch promises (prevents Cache Stampedes)
const CACHE_DURATION_MS = 1000 * 60 * 60 * 24 // 24 hours

app.get('/api/playlist/:id', async (req, res) => {
  let yt;
  try {
    yt = await ytPromise;
  } catch (error) {
    return res.status(500).json({ error: 'InnerTube failed to initialize' })
  }
  const { id } = req.params

  // 1. Check if we already have it in the cache!
  const cached = cache.get(id)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return res.json({ items: cached.items })
  }

  // 2. Cache Stampede Protection: 
  // If another user is already fetching this playlist, just wait for their result!
  if (pendingRequests.has(id)) {
    try {
      const items = await pendingRequests.get(id)
      return res.json({ items })
    } catch (error) {
      return res.status(502).json({ error: 'All proxies failed', items: [] })
    }
  }


  // 3. Create the fetch operation
  const fetchOperation = (async () => {
    try {
      const playlist = await yt.getPlaylist(id)
      
      const items = playlist.items.map(item => {
        return {
          title: item.metadata?.title?.text || 'Unknown Title',
          artist: item.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.text || 'Unknown Artist',
          youtubeId: item.content_id,
          duration: '',
          thumbnail: item.content_image?.image?.[0]?.url || '',
        }
      });
      
      // Save to Cache
      cache.set(id, { timestamp: Date.now(), items })
      return items
    } catch (error) {
      throw error
    }
  })();

  // 4. Save the ongoing operation so concurrent users can piggyback on it
  pendingRequests.set(id, fetchOperation)

  try {
    const items = await fetchOperation
    res.json({ items })
  } catch (error) {
    console.error(`Failed to fetch playlist ${id} from YouTube:`, error)
    res.status(502).json({ error: 'YouTube API failed', items: [] })
  } finally {
    // 5. Clean up the pending request once it's done
    pendingRequests.delete(id)
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend proxy running on http://localhost:${PORT}`)
})

// Export for Vercel Serverless Functions
module.exports = app

