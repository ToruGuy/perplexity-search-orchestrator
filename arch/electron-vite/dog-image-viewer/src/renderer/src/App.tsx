import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Heart, Loader2 } from 'lucide-react'
import Gallery from './components/Gallery'
import { storage } from './utils/storage'
import './App.css'

interface DogImageResponse {
  url: string
}

function App() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [likedImages, setLikedImages] = useState<string[]>([])
  const [showGallery, setShowGallery] = useState<boolean>(false)
  const [imageCache, setImageCache] = useState<string[]>([])
  const [hasInitialImage, setHasInitialImage] = useState<boolean>(false)
  const [storageReady, setStorageReady] = useState<boolean>(false)

  const fetchDogImage = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('https://random.dog/woof.json')
      if (!response.ok) {
        throw new Error('Failed to fetch dog image')
      }
      const data: DogImageResponse = await response.json()
      
      // Add to cache if not already there
      setImageCache(prevCache => {
        if (!prevCache.includes(data.url)) {
          const newCache = [...prevCache, data.url]
          storage.saveImageCache(newCache).catch(err => {
            console.error('Error saving image cache:', err)
          })
          return newCache
        }
        return prevCache
      })
      
      setImageUrl(data.url)
      setHasInitialImage(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setImageUrl('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load data from file storage on initial load
    const loadData = async () => {
      try {
        // Load liked images
        const liked = await storage.getLikedDogs()
        setLikedImages(liked)
        
        // Load image cache
        const cached = await storage.getImageCache()
        setImageCache(cached)
        
        // Restore last viewed image
        const lastImage = await storage.getLastImage()
        if (lastImage) {
          setImageUrl(lastImage)
          setHasInitialImage(true)
        } else {
          // Only fetch if no last image exists
          fetchDogImage()
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback: fetch new image if loading fails
        fetchDogImage()
      } finally {
        setStorageReady(true)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    // Save liked images to file whenever it changes
    if (!storageReady) return
    if (likedImages.length >= 0) {
      storage.saveLikedDogs(likedImages).catch(err => {
        console.error('Error saving liked dogs:', err)
      })
    }
  }, [likedImages, storageReady])

  useEffect(() => {
    // Save image cache to file whenever it changes
    if (!storageReady) return
    storage.saveImageCache(imageCache).catch(err => {
      console.error('Error saving image cache:', err)
    })
  }, [imageCache, storageReady])

  useEffect(() => {
    // Save current image to file
    if (imageUrl) {
      storage.saveLastImage(imageUrl).catch(err => {
        console.error('Error saving last image:', err)
      })
    }
  }, [imageUrl])


  const handleLike = () => {
    if (imageUrl && !likedImages.includes(imageUrl)) {
      setLikedImages([...likedImages, imageUrl])
    }
  }

  const isLiked = imageUrl && likedImages.includes(imageUrl)

  if (showGallery) {
    return (
      <Gallery 
        likedImages={likedImages} 
        setLikedImages={setLikedImages}
        onBack={() => setShowGallery(false)}
      />
    )
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Vibe doggies</h1>
        <Button 
          variant="outline"
          onClick={() => setShowGallery(true)}
        >
          Gallery ({likedImages.length})
        </Button>
      </div>
      <Card className="image-card">
        <CardContent className="image-content">
          {loading && (
            <div className="loading-overlay">
              <Loader2 className="loading-spinner" />
            </div>
          )}
          {imageUrl && !loading && (
            <>
              <img 
                src={imageUrl} 
                alt="" 
                className="dog-image"
                onError={() => {
                  fetchDogImage()
                }}
              />
              <Button
                variant={isLiked ? "destructive" : "secondary"}
                size="icon"
                className="like-button"
                onClick={handleLike}
                disabled={isLiked}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Button 
        onClick={fetchDogImage} 
        disabled={loading}
        size="lg"
        className="next-image-button"
      >
        {loading ? (
          <>
            <Loader2 className="button-spinner" />
            Loading...
          </>
        ) : (
          'next image'
        )}
      </Button>
    </div>
  )
}

export default App

