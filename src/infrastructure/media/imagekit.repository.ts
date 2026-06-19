/**
 * imagekit.repository.ts
 * Responsabilidad: Adapter para envolver URLs de imágenes del catálogo con
 * transformaciones de ImageKit CDN (redimensionado, formato WebP, calidad,
 * recorte). Permite generar URLs optimizadas según el contexto de visualización.
 *
 * Tipos de datos: método transform(url: string, options: ImageKitOptions): string,
 * interface ImageKitOptions (width, height, quality, format, focus, etc.).
 */