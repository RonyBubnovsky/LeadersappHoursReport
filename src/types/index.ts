/**
 * TypeScript type definitions for the Hours Tracker application.
 */

// Database types matching Supabase schema
export interface Sheet {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Entry {
  id: string
  sheet_id: string
  class_name: string
  date_str: string
  start_time: string
  end_time: string
  total_hours: string
  pay_hours: number
  created_at: string
}

// Form input types
export interface CreateSheetInput {
  name: string
}

export interface CreateEntryInput {
  sheet_id: string
  class_name: string
  date_str: string
  start_time: string
  end_time: string
}

// Calculated entry with auto-computed fields
export interface EntryWithCalculations extends CreateEntryInput {
  total_hours: string
  pay_hours: number
}

// User from Supabase Auth
export interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

// Saved export metadata from Supabase
export interface SavedExport {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number | null
  sheets_count: number
  total_hours: number
  created_at: string
}

// Attendance link (external Drive/website links)
export interface AttendanceLink {
  id: string
  user_id: string
  name: string
  url: string
  created_at: string
}
