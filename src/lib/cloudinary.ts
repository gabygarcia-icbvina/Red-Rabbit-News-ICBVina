// src/lib/cloudinary.ts
// Variables requeridas en .env:
//   PUBLIC_CLOUDINARY_CLOUD_NAME=...
//   PUBLIC_CLOUDINARY_UPLOAD_PRESET=...  (unsigned preset)
//   CLOUDINARY_API_KEY=...
//   CLOUDINARY_API_SECRET=...

const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET

/**
 * Sube un File desde el cliente al unsigned upload preset de Cloudinary.
 * Retorna la URL segura de la imagen subida.
 */
export async function uploadImage(file: File, folder = 'redrabbit'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Error al subir imagen a Cloudinary')

  const data = await res.json()
  return data.secure_url as string
}

/**
 * Construye una URL de Cloudinary con transformaciones opcionales.
 */
export function cloudinaryUrl(
  url: string,
  opts: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url?.includes('cloudinary.com')) return url
  const { width, height, quality = 80 } = opts
  const transforms = [
    'f_auto',
    `q_${quality}`,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    'c_fill',
  ]
    .filter(Boolean)
    .join(',')

  return url.replace('/upload/', `/upload/${transforms}/`)
}
