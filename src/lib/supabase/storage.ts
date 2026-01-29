import { createClient } from './client'
import type { SavedExport } from '@/types'

const BUCKET_NAME = 'exports'

interface UploadMetadata {
  sheetsCount: number
  totalHours: number
}

/**
 * Upload an Excel file to Supabase Storage and save metadata.
 */
export async function uploadExport(
  buffer: ArrayBuffer | Uint8Array,
  filename: string,
  userId: string,
  metadata: UploadMetadata
): Promise<SavedExport | null> {
  const supabase = createClient()
  
  // Create file path: {user_id}/{timestamp}_{sanitized_filename}.xlsx
  // Note: Supabase Storage only allows ASCII characters in paths
  const timestamp = Date.now()
  const sanitizedFilename = filename
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // Replace non-ASCII chars with underscore
    .replace(/_+/g, '_')              // Collapse multiple underscores
    .replace(/^_|_$/g, '')            // Trim leading/trailing underscores
    || 'export'                        // Fallback if empty
  const filePath = `${userId}/${timestamp}_${sanitizedFilename}.xlsx`
  
  // Ensure buffer is a proper ArrayBuffer for Blob compatibility
  let arrayBuffer: ArrayBuffer
  if (buffer instanceof ArrayBuffer) {
    arrayBuffer = buffer
  } else {
    // For Uint8Array, create a new ArrayBuffer copy
    const uint8 = buffer as Uint8Array
    arrayBuffer = new ArrayBuffer(uint8.byteLength)
    new Uint8Array(arrayBuffer).set(uint8)
  }
  
  // Convert buffer to Blob for upload
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  
  // Upload file to Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, blob, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: false
    })
  
  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return null
  }
  
  // Save metadata to database
  const { data, error: dbError } = await supabase
    .from('saved_exports')
    .insert({
      user_id: userId,
      file_name: `${filename}.xlsx`,
      file_path: filePath,
      file_size: blob.size,
      sheets_count: metadata.sheetsCount,
      total_hours: metadata.totalHours
    })
    .select()
    .single()
  
  if (dbError) {
    console.error('Error saving export metadata:', dbError)
    // Try to delete the uploaded file if metadata save failed
    await supabase.storage.from(BUCKET_NAME).remove([filePath])
    return null
  }
  
  return data as SavedExport
}

/**
 * Download an export file from Storage.
 */
export async function downloadExport(filePath: string, fileName: string): Promise<void> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath)
  
  if (error) {
    console.error('Error downloading file:', error)
    throw new Error('שגיאה בהורדת הקובץ')
  }
  
  // Create download link
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Delete an export file and its metadata.
 */
export async function deleteExport(id: string, filePath: string): Promise<boolean> {
  const supabase = createClient()
  
  // Delete file from Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])
  
  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // Continue to try deleting metadata anyway
  }
  
  // Delete metadata from database
  const { error: dbError } = await supabase
    .from('saved_exports')
    .delete()
    .eq('id', id)
  
  if (dbError) {
    console.error('Error deleting export metadata:', dbError)
    return false
  }
  
  return true
}

/**
 * List all exports for the current user.
 */
export async function listExports(): Promise<SavedExport[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('saved_exports')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error listing exports:', error)
    return []
  }
  
  return data as SavedExport[]
}
