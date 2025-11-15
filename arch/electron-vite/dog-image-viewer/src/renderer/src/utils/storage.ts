// Storage utility using Electron IPC for file-based persistence

declare global {
  interface Window {
    electron: {
      storage: {
        getLikedDogs: () => Promise<string[]>
        saveLikedDogs: (likedDogs: string[]) => Promise<void>
        getImageCache: () => Promise<string[]>
        saveImageCache: (cache: string[]) => Promise<void>
        getLastImage: () => Promise<string | null>
        saveLastImage: (imageUrl: string) => Promise<void>
      }
    }
  }
}

export const storage = {
  async getLikedDogs(): Promise<string[]> {
    if (window.electron?.storage) {
      try {
        const result = await window.electron.storage.getLikedDogs()
        console.log('Loaded liked dogs from file:', result.length)
        return result
      } catch (error) {
        console.error('Error loading liked dogs:', error)
        return []
      }
    }
    // Fallback to localStorage if Electron API not available
    const stored = localStorage.getItem('likedDogs')
    return stored ? JSON.parse(stored) : []
  },

  async saveLikedDogs(likedDogs: string[]): Promise<void> {
    if (window.electron?.storage) {
      try {
        await window.electron.storage.saveLikedDogs(likedDogs)
        console.log('Saved liked dogs to file:', likedDogs.length)
      } catch (error) {
        console.error('Error saving liked dogs:', error)
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem('likedDogs', JSON.stringify(likedDogs))
    }
  },

  async getImageCache(): Promise<string[]> {
    if (window.electron?.storage) {
      return await window.electron.storage.getImageCache()
    }
    const cached = localStorage.getItem('imageCache')
    return cached ? JSON.parse(cached) : []
  },

  async saveImageCache(cache: string[]): Promise<void> {
    if (window.electron?.storage) {
      await window.electron.storage.saveImageCache(cache)
    } else {
      localStorage.setItem('imageCache', JSON.stringify(cache))
    }
  },

  async getLastImage(): Promise<string | null> {
    if (window.electron?.storage) {
      return await window.electron.storage.getLastImage()
    }
    return localStorage.getItem('lastImage')
  },

  async saveLastImage(imageUrl: string): Promise<void> {
    if (window.electron?.storage) {
      await window.electron.storage.saveLastImage(imageUrl)
    } else {
      localStorage.setItem('lastImage', imageUrl)
    }
  }
}

