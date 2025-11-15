import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'

const isDev = !app.isPackaged

// Get user data path for storing files
const getUserDataPath = () => {
  return app.getPath('userData')
}

const getLikedDogsPath = () => {
  return join(getUserDataPath(), 'liked-dogs.json')
}

const getImageCachePath = () => {
  return join(getUserDataPath(), 'image-cache.json')
}

const getLastImagePath = () => {
  return join(getUserDataPath(), 'last-image.json')
}

const getPreloadPath = () => {
  const preloadJs = join(__dirname, '../preload/index.js')
  if (existsSync(preloadJs)) {
    return preloadJs
  }

  // electron-vite outputs CommonJS preload bundles with .cjs when package.json has type=module
  return join(__dirname, '../preload/index.cjs')
}

// Read JSON file helper
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    if (existsSync(filePath)) {
      const data = await readFile(filePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
  }
  return defaultValue
}

// Write JSON file helper
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    throw error
  }
}

// IPC handlers for file storage
ipcMain.handle('storage:getLikedDogs', async () => {
  const path = getLikedDogsPath()
  console.log('Reading liked dogs from:', path)
  const result = await readJsonFile<string[]>(path, [])
  console.log('Loaded', result.length, 'liked dogs')
  return result
})

ipcMain.handle('storage:saveLikedDogs', async (_event, likedDogs: string[]) => {
  const path = getLikedDogsPath()
  console.log('Saving', likedDogs.length, 'liked dogs to:', path)
  await writeJsonFile(path, likedDogs)
  console.log('Successfully saved liked dogs')
})

ipcMain.handle('storage:getImageCache', async () => {
  return await readJsonFile<string[]>(getImageCachePath(), [])
})

ipcMain.handle('storage:saveImageCache', async (_event, cache: string[]) => {
  await writeJsonFile(getImageCachePath(), cache)
})

ipcMain.handle('storage:getLastImage', async () => {
  return await readJsonFile<string | null>(getLastImagePath(), null)
})

ipcMain.handle('storage:saveLastImage', async (_event, imageUrl: string) => {
  await writeJsonFile(getLastImagePath(), imageUrl)
})

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Vibe doggies',
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

