import { del, get, put } from '@vercel/blob'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

function mimeFromPath(filePathOrName: string): string {
  const ext = path.extname(filePathOrName).toLowerCase()
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.doc': 'application/msword',
    '.docx':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return map[ext] ?? 'application/octet-stream'
}

/** Stored private blob URL from Vercel Blob. */
export function isVercelBlobUrl(url: string): boolean {
  return url.startsWith('https://') && url.includes('.blob.vercel-storage.com/')
}

export function isLocalUploadUrl(url: string): boolean {
  return url.startsWith('/uploads/')
}

/**
 * Writes a private file to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set,
 * otherwise to `public/uploads/...` for local development.
 */
export async function storePrivateUpload(
  pathname: string,
  body: Buffer,
  contentTypeHint?: string
): Promise<{ storedUrl: string }> {
  const trimmedHint = contentTypeHint?.trim()
  const contentType =
    trimmedHint &&
    trimmedHint !== '' &&
    trimmedHint !== 'application/octet-stream'
      ? trimmedHint
      : mimeFromPath(pathname)

  if (BLOB_TOKEN) {
    const blob = await put(pathname, body, {
      access: 'private',
      token: BLOB_TOKEN,
      contentType,
    })
    return { storedUrl: blob.url }
  }

  if (process.env.VERCEL === '1') {
    throw new Error(
      'Blob storage is not configured. In Vercel: Project → Storage → create/connect a Blob store so BLOB_READ_WRITE_TOKEN is available.'
    )
  }

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length < 2) {
    throw new Error('Invalid pathname')
  }
  const fileName = segments[segments.length - 1]
  const subDirs = segments.slice(0, -1)
  if (subDirs.some((s) => s === '..' || s.includes('..'))) {
    throw new Error('Invalid pathname')
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', ...subDirs)
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, fileName), body)

  return { storedUrl: `/uploads/${subDirs.join('/')}/${fileName}` }
}

export async function readStoredFile(
  storedUrl: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (isVercelBlobUrl(storedUrl)) {
    const result = await get(storedUrl, { access: 'private' })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return null
    }
    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer())
    return { buffer, contentType: result.blob.contentType }
  }

  if (isLocalUploadUrl(storedUrl)) {
    const rel = storedUrl.replace(/^\/uploads\//, '')
    if (!rel || rel.includes('..') || rel.includes('\\')) {
      return null
    }
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...rel.split('/'))
    try {
      const buffer = await readFile(filePath)
      return { buffer, contentType: mimeFromPath(filePath) }
    } catch {
      return null
    }
  }

  return null
}

/** Best-effort delete of a previous blob when replacing a file. */
export async function deleteBlobIfExists(url: string | null | undefined): Promise<void> {
  if (!url || !isVercelBlobUrl(url) || !BLOB_TOKEN) return
  try {
    await del(url, { token: BLOB_TOKEN })
  } catch {
    // ignore — object may already be gone
  }
}
