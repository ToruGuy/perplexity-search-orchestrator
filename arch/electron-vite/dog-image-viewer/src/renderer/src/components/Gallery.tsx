import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Heart, X } from 'lucide-react'

interface GalleryProps {
  likedImages: string[]
  setLikedImages: (images: string[]) => void
  onBack: () => void
}

function Gallery({ likedImages, setLikedImages, onBack }: GalleryProps) {
  const handleRemove = (url: string) => {
    setLikedImages(likedImages.filter(img => img !== url))
  }

  return (
    <div className="app-container">
      <div className="gallery-header">
        <h2 className="gallery-title">Liked Dogs ({likedImages.length})</h2>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
      {likedImages.length === 0 ? (
        <Card className="empty-gallery">
          <CardContent>
            <p className="empty-text">No liked dogs yet. Start liking some!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="gallery-grid">
          {likedImages.map((url, index) => (
            <Card key={index} className="gallery-card">
              <CardContent className="gallery-card-content">
                <img 
                  src={url} 
                  alt={`Liked dog ${index + 1}`}
                  className="gallery-image"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="remove-button"
                  onClick={() => handleRemove(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery

