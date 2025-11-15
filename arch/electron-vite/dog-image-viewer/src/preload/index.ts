import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the APIs without exposing the entire Node.js API
contextBridge.exposeInMainWorld('electron', {
  storage: {
    getLikedDogs: () => ipcRenderer.invoke('storage:getLikedDogs'),
    saveLikedDogs: (likedDogs: string[]) => ipcRenderer.invoke('storage:saveLikedDogs', likedDogs),
    getImageCache: () => ipcRenderer.invoke('storage:getImageCache'),
    saveImageCache: (cache: string[]) => ipcRenderer.invoke('storage:saveImageCache', cache),
    getLastImage: () => ipcRenderer.invoke('storage:getLastImage'),
    saveLastImage: (imageUrl: string) => ipcRenderer.invoke('storage:saveLastImage', imageUrl),
  }
})

