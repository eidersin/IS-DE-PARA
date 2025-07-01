import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class FileUtils {
  static getProjectRoot() {
    return path.join(__dirname, '..', '..')
  }

  static getBackendRoot() {
    return path.join(__dirname, '..')
  }

  static async ensureDirectories(directories) {
    for (const dir of directories) {
      await fs.ensureDir(dir)
    }
  }

  static async cleanupFile(filePath) {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath)
      }
    } catch (error) {
      console.warn(`Falha ao limpar arquivo ${filePath}:`, error.message)
    }
  }

  static generateUniqueFilename(originalName, prefix = 'document') {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(originalName)
    return `${prefix}-${uniqueSuffix}${extension}`
  }

  static async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath)
      return stats.size
    } catch (error) {
      return 0
    }
  }
}