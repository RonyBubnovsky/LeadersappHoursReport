import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/client'
import { uploadExport } from '@/lib/supabase/storage'
import type { Entry, Sheet, SavedExport } from '@/types'

interface ExportOptions {
  saveToCloud?: boolean
  userId?: string
  onSuccess?: (savedExport: SavedExport) => void
}

/**
 * Export entries to Excel file with RTL support.
 */
export async function exportToExcel(entries: Entry[], sheetName: string): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Hours Tracker'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31), {
    views: [{ rightToLeft: true }]
  })

  // Define columns with Hebrew headers
  worksheet.columns = [
    { header: 'שם הכיתה', key: 'class_name', width: 20 },
    { header: 'תאריך', key: 'date_str', width: 15 },
    { header: 'שעת התחלה', key: 'start_time', width: 12 },
    { header: 'שעת סיום', key: 'end_time', width: 12 },
    { header: 'סה"כ שעות', key: 'total_hours', width: 12 },
    { header: 'שעות לתשלום', key: 'pay_hours', width: 14 },
  ]

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }
  }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add data rows
  entries.forEach(entry => {
    worksheet.addRow({
      class_name: entry.class_name,
      date_str: entry.date_str,
      start_time: entry.start_time,
      end_time: entry.end_time,
      total_hours: entry.total_hours,
      pay_hours: entry.pay_hours,
    })
  })

  // Add total row
  const totalRow = worksheet.addRow({
    class_name: 'סה"כ',
    pay_hours: entries.reduce((sum, e) => sum + e.pay_hours, 0)
  })
  totalRow.font = { bold: true }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(buffer, `${sheetName}_${formatDate()}.xlsx`)
}

/**
 * Export all sheets to a single Excel file with multiple worksheets.
 */
export async function exportAllToExcel(sheets: Sheet[], filename?: string, options?: ExportOptions): Promise<void> {
  const supabase = createClient()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Hours Tracker'
  workbook.created = new Date()

  let grandTotal = 0
  const allEntriesForSummary: { 
    sheetName: string; 
    className: string; 
    date: string; 
    startTime: string;
    endTime: string;
    totalHours: string;
    hours: number 
  }[] = []

  for (const sheet of sheets) {
    const { data: entries } = await supabase
      .from('entries')
      .select('*')
      .eq('sheet_id', sheet.id)
      .order('created_at', { ascending: true }) as { data: Entry[] | null }

    if (!entries || entries.length === 0) continue

    const worksheet = workbook.addWorksheet(sheet.name.slice(0, 31), {
      views: [{ rightToLeft: true }]
    })

    worksheet.columns = [
      { header: 'שם הכיתה', key: 'class_name', width: 20 },
      { header: 'תאריך', key: 'date_str', width: 15 },
      { header: 'שעת התחלה', key: 'start_time', width: 12 },
      { header: 'שעת סיום', key: 'end_time', width: 12 },
      { header: 'סה"כ שעות', key: 'total_hours', width: 12 },
      { header: 'שעות לתשלום', key: 'pay_hours', width: 14 },
    ]

    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0EA5E9' }
    }

    entries.forEach(entry => {
      worksheet.addRow(entry)
      // Format total_hours to HH:MM:SS for summary
      const totalHoursFormatted = formatTotalHours(entry.total_hours)
      allEntriesForSummary.push({
        sheetName: sheet.name,
        className: entry.class_name,
        date: entry.date_str,
        startTime: entry.start_time,
        endTime: entry.end_time,
        totalHours: totalHoursFormatted,
        hours: entry.pay_hours,
      })
    })

    const sheetTotal = entries.reduce((sum, e) => sum + e.pay_hours, 0)
    grandTotal += sheetTotal

    const totalRow = worksheet.addRow({
      class_name: 'סה"כ',
      pay_hours: sheetTotal
    })
    totalRow.font = { bold: true }
  }

  // Add summary worksheet with detailed entries
  const summarySheet = workbook.addWorksheet('סיכום', {
    views: [{ rightToLeft: true }]
  })
  
  summarySheet.columns = [
    { header: 'שם הגיליון', key: 'sheetName', width: 20 },
    { header: 'שם הכיתה/פעילות', key: 'className', width: 25 },
    { header: 'תאריך', key: 'date', width: 15 },
    { header: 'שעת התחלה', key: 'startTime', width: 12 },
    { header: 'שעת סיום', key: 'endTime', width: 12 },
    { header: 'סה"כ שעות', key: 'totalHours', width: 12 },
    { header: 'שעות לתשלום', key: 'hours', width: 15 },
  ]

  const summaryHeader = summarySheet.getRow(1)
  summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF22C55E' }
  }

  // Add each entry to summary
  allEntriesForSummary.forEach(entry => {
    summarySheet.addRow(entry)
  })

  // Add grand total row
  const grandTotalRow = summarySheet.addRow({ 
    sheetName: 'סה"כ כללי', 
    hours: grandTotal 
  })
  grandTotalRow.font = { bold: true }

  const finalFilename = filename || `דוח_מלא_${formatDate()}`
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(buffer, `${finalFilename}.xlsx`)

  // Save to Supabase Storage if requested
  if (options?.saveToCloud && options?.userId) {
    try {
      const savedExport = await uploadExport(buffer, finalFilename, options.userId, {
        sheetsCount: sheets.length,
        totalHours: grandTotal
      })
      // Call onSuccess callback with the saved export for immediate UI update
      if (savedExport && options.onSuccess) {
        options.onSuccess(savedExport)
      }
    } catch (error) {
      console.error('Error saving export to cloud:', error)
      // Don't throw - the local download already succeeded
    }
  }
}

function downloadBlob(buffer: ArrayBuffer | ExcelJS.Buffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function formatDate(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

/**
 * Format total hours to HH:MM:SS format.
 * Handles formats like "2 שעות ו-30 דקות" or "2:30" etc.
 */
function formatTotalHours(totalHours: string): string {
  if (!totalHours) return '00:00:00'
  
  // If already in HH:MM format, add seconds
  if (/^\d{1,2}:\d{2}$/.test(totalHours)) {
    return `${totalHours}:00`
  }
  
  // If already in HH:MM:SS format, return as is
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(totalHours)) {
    return totalHours
  }
  
  // Try to parse Hebrew format "X שעות ו-Y דקות"
  const hebrewMatch = totalHours.match(/(\d+)\s*שעות?(?:\s*ו[־-]?(\d+)\s*דקות?)?/)
  if (hebrewMatch) {
    const hours = parseInt(hebrewMatch[1]) || 0
    const minutes = parseInt(hebrewMatch[2]) || 0
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
  }
  
  // Return original with :00 if nothing matches
  return totalHours.includes(':') ? `${totalHours}:00` : `${totalHours}:00:00`
}
