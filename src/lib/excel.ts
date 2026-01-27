import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/client'
import type { Entry, Sheet } from '@/types'

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
export async function exportAllToExcel(sheets: Sheet[]): Promise<void> {
  const supabase = createClient()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Hours Tracker'
  workbook.created = new Date()

  let grandTotal = 0

  for (const sheet of sheets) {
    const { data: entries } = await supabase
      .from('entries')
      .select('*')
      .eq('sheet_id', sheet.id)
      .order('created_at', { ascending: false })

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
    })

    const sheetTotal = entries.reduce((sum, e) => sum + e.pay_hours, 0)
    grandTotal += sheetTotal

    const totalRow = worksheet.addRow({
      class_name: 'סה"כ',
      pay_hours: sheetTotal
    })
    totalRow.font = { bold: true }
  }

  // Add summary worksheet
  const summarySheet = workbook.addWorksheet('סיכום', {
    views: [{ rightToLeft: true }]
  })
  
  summarySheet.columns = [
    { header: 'שם הגיליון', key: 'name', width: 25 },
    { header: 'סה"כ שעות', key: 'total', width: 15 },
  ]

  const summaryHeader = summarySheet.getRow(1)
  summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF22C55E' }
  }

  summarySheet.addRow({ name: 'סה"כ כללי', total: grandTotal })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(buffer, `דוח_מלא_${formatDate()}.xlsx`)
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
