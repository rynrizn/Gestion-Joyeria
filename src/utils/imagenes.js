import { supabase, isSupabaseConfigured } from '../supabase/client'

/**
 * Convierte cualquier archivo de imagen (PNG, JPG, JPEG, etc.) a formato .webp
 * redimensionándolo proporcionalmente para optimizar el rendimiento y el peso.
 *
 * @param {File} archivo - Archivo original seleccionado por la usuaria.
 * @param {number} [calidad=0.85] - Calidad de compresión WebP (0 a 1).
 * @param {number} [anchoMax=1200] - Ancho máximo permitido en píxeles.
 * @returns {Promise<File>} Archivo convertido a formato .webp
 */
export async function convertirAWebp(archivo, calidad = 0.85, anchoMax = 1200) {
  if (!archivo || !archivo.type.startsWith('image/')) {
    return archivo
  }

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (evento) => {
      const img = new Image()

      img.onload = () => {
        let ancho = img.width
        let alto = img.height

        // Redimensionar proporcionalmente si la foto excede el ancho máximo
        if (ancho > anchoMax) {
          alto = Math.round((alto * anchoMax) / ancho)
          ancho = anchoMax
        }

        const canvas = document.createElement('canvas')
        canvas.width = ancho
        canvas.height = alto

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, ancho, alto)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const nombreBase = archivo.name.replace(/\.[^/.]+$/, '')
              const archivoWebp = new File([blob], `${nombreBase}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
              resolve(archivoWebp)
            } else {
              resolve(archivo) // Fallback al original si toBlob no responde
            }
          },
          'image/webp',
          calidad
        )
      }

      img.onerror = () => resolve(archivo)
      img.src = evento.target.result
    }

    reader.onerror = () => resolve(archivo)
    reader.readAsDataURL(archivo)
  })
}

/**
 * Sube una imagen en formato .webp al bucket público de Supabase Storage
 * y retorna la URL pública permanente para almacenarla en la base de datos.
 *
 * @param {File} archivoWebp - Imagen en formato .webp.
 * @param {string} [carpeta='joyas'] - Subcarpeta dentro del bucket.
 * @returns {Promise<string>} URL pública permanente de la imagen.
 */
export async function subirImagenStorage(archivoWebp, carpeta = 'joyas') {
  if (!isSupabaseConfigured || !archivoWebp) {
    return null
  }

  const nombreLimpio = archivoWebp.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const rutaArchivo = `${carpeta}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${nombreLimpio}`

  try {
    const { data, error } = await supabase.storage
      .from('productos')
      .upload(rutaArchivo, archivoWebp, {
        contentType: 'image/webp',
        cacheControl: '31536000', // Caché de 1 año
        upsert: true,
      })

    if (error) {
      console.warn('⚠️ [Supabase Storage] No se pudo subir al bucket productos:', error.message)
      return null
    }

    const { data: dataUrl } = supabase.storage
      .from('productos')
      .getPublicUrl(rutaArchivo)

    return dataUrl?.publicUrl || null
  } catch (err) {
    console.warn('⚠️ [Supabase Storage] Error en la carga:', err.message)
    return null
  }
}
