'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiX, FiCheck, FiAlertCircle, FiArrowLeft, FiArrowRight, FiFile } from 'react-icons/fi'
import { useTheme } from '@/lib/theme-context'
import { useCurrency } from '@/contexts/CurrencyContext'
import { getSubscriptionIcon } from '@/lib/icons'
import {
  parseCSV,
  parseJSON,
  detectColumnMapping,
  processRows,
  type ParsedRow,
  type SubscriptionCandidate,
} from '@/lib/csvParser'
import { bulkCreateSubscriptions } from '@/lib/supabase/queries'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImported: () => void
}

type Step = 'upload' | 'mapping' | 'preview'

export function ImportModal({ isOpen, onClose, onImported }: ImportModalProps) {
  const { isDark } = useTheme()
  const { formatAmount } = useCurrency()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv')

  // CSV-specific state
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [nameColumn, setNameColumn] = useState<string>('')
  const [costColumn, setCostColumn] = useState<string>('')
  const [dateColumn, setDateColumn] = useState<string>('')

  // Candidates for import
  const [candidates, setCandidates] = useState<SubscriptionCandidate[]>([])
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const resetState = () => {
    setStep('upload')
    setFileName('')
    setFileContent('')
    setHeaders([])
    setRows([])
    setNameColumn('')
    setCostColumn('')
    setDateColumn('')
    setCandidates([])
    setImportError(null)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setFileContent(content)
      setFileName(file.name)

      if (file.name.endsWith('.json')) {
        setFileType('json')
        // JSON files skip mapping step
        const parsed = parseJSON(content)
        setCandidates(parsed)
        setStep('preview')
      } else {
        setFileType('csv')
        const { headers: h, rows: r } = parseCSV(content)
        setHeaders(h)
        setRows(r)
        // Auto-detect columns
        const mapping = detectColumnMapping(h)
        setNameColumn(mapping.nameColumn || h[0] || '')
        setCostColumn(mapping.costColumn || h[1] || '')
        setDateColumn(mapping.dateColumn || '')
        setStep('mapping')
      }
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.json'))) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleProcessMapping = () => {
    if (!nameColumn || !costColumn) return
    const processed = processRows(rows, { nameColumn, costColumn, dateColumn })
    setCandidates(processed)
    setStep('preview')
  }

  const toggleCandidate = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    )
  }

  const updateCandidate = (id: string, field: keyof SubscriptionCandidate, value: any) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const handleImport = async () => {
    const selected = candidates.filter((c) => c.selected)
    if (selected.length === 0) return

    setImporting(true)
    setImportError(null)

    const subscriptions = selected.map((c) => ({
      name: c.name,
      category: c.category,
      cost: c.cost,
      billing_cycle: c.billing_cycle,
      renewal_date: new Date(c.renewal_date).toISOString(),
      status: 'active' as const,
      cancellation_difficulty: 'medium' as const,
      logo_identifier: c.name.toLowerCase().trim(),
    }))

    const { created, errors } = await bulkCreateSubscriptions(subscriptions)

    if (errors.length > 0) {
      setImportError(`Imported ${created} subscriptions. ${errors.length} failed.`)
    }

    setImporting(false)

    if (created > 0) {
      onImported()
      handleClose()
    }
  }

  const selectedCount = candidates.filter((c) => c.selected).length

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border ${
            isDark
              ? 'bg-[#0A0A0A] border-[#1A1A1A]'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b ${
            isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-[#111111]' : 'bg-gray-100'
              }`}>
                <FiUpload className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
              </div>
              <div>
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                  Import Subscriptions
                </h2>
                <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                  Step {step === 'upload' ? '1' : step === 'mapping' ? '2' : '3'} of {fileType === 'json' ? '2' : '3'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-[#111111] text-[#666666]' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            {/* Step 1: Upload */}
            {step === 'upload' && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? isDark
                      ? 'border-white bg-white/5'
                      : 'border-black bg-black/5'
                    : isDark
                      ? 'border-[#333333] hover:border-[#555555]'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <FiUpload className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-[#444444]' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                  Drop your file here or click to browse
                </p>
                <p className={`text-xs ${isDark ? 'text-[#555555]' : 'text-gray-500'}`}>
                  Supports CSV (bank statements) and JSON files
                </p>
              </div>
            )}

            {/* Step 2: Column Mapping (CSV only) */}
            {step === 'mapping' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiFile className={`w-4 h-4 ${isDark ? 'text-[#555555]' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>
                    {fileName} ({rows.length} rows)
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
                      isDark ? 'text-[#999999]' : 'text-gray-600'
                    }`}>
                      Name / Vendor Column *
                    </label>
                    <select
                      value={nameColumn}
                      onChange={(e) => setNameColumn(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isDark
                          ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white'
                          : 'bg-gray-50 border border-gray-300 text-black'
                      }`}
                    >
                      <option value="">Select column...</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
                      isDark ? 'text-[#999999]' : 'text-gray-600'
                    }`}>
                      Amount / Cost Column *
                    </label>
                    <select
                      value={costColumn}
                      onChange={(e) => setCostColumn(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isDark
                          ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white'
                          : 'bg-gray-50 border border-gray-300 text-black'
                      }`}
                    >
                      <option value="">Select column...</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
                      isDark ? 'text-[#999999]' : 'text-gray-600'
                    }`}>
                      Date Column (optional)
                    </label>
                    <select
                      value={dateColumn}
                      onChange={(e) => setDateColumn(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isDark
                          ? 'bg-[#0D0D0D] border border-[#1F1F1F] text-white'
                          : 'bg-gray-50 border border-gray-300 text-black'
                      }`}
                    >
                      <option value="">Select column...</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 'preview' && (
              <div className="space-y-4">
                {importError && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                  }`}>
                    <FiAlertCircle className="w-4 h-4" />
                    <span className="text-sm">{importError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm ${isDark ? 'text-[#999999]' : 'text-gray-600'}`}>
                    {selectedCount} of {candidates.length} subscriptions selected
                  </span>
                  <button
                    onClick={() => setCandidates((prev) => prev.map((c) => ({ ...c, selected: !c.selected })))}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      isDark
                        ? 'text-[#999999] hover:text-white hover:bg-[#111111]'
                        : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    Toggle all
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {candidates.map((c) => {
                    const Icon = getSubscriptionIcon(c.name)
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          c.selected
                            ? isDark
                              ? 'bg-[#0D0D0D] border-[#333333]'
                              : 'bg-gray-50 border-gray-300'
                            : isDark
                              ? 'bg-transparent border-[#1A1A1A] opacity-50'
                              : 'bg-transparent border-gray-200 opacity-50'
                        }`}
                      >
                        <button
                          onClick={() => toggleCandidate(c.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            c.selected
                              ? isDark
                                ? 'bg-white border-white text-black'
                                : 'bg-black border-black text-white'
                              : isDark
                                ? 'border-[#333333]'
                                : 'border-gray-300'
                          }`}
                        >
                          {c.selected && <FiCheck className="w-3 h-3" />}
                        </button>

                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-[#111111]' : 'bg-gray-200'
                        }`}>
                          <Icon className={`w-4 h-4 ${isDark ? 'text-[#999999]' : 'text-gray-600'}`} />
                        </div>

                        <div className="flex-1 min-w-0 grid grid-cols-4 gap-2 items-center">
                          <input
                            type="text"
                            value={c.name}
                            onChange={(e) => updateCandidate(c.id, 'name', e.target.value)}
                            className={`text-sm font-medium truncate px-2 py-1 rounded ${
                              isDark
                                ? 'bg-transparent text-white focus:bg-[#111111]'
                                : 'bg-transparent text-black focus:bg-gray-100'
                            }`}
                          />
                          <select
                            value={c.category}
                            onChange={(e) => updateCandidate(c.id, 'category', e.target.value)}
                            className={`text-xs px-2 py-1 rounded ${
                              isDark
                                ? 'bg-[#111111] text-[#999999]'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <option value="Entertainment">Entertainment</option>
                            <option value="Productivity">Productivity</option>
                            <option value="Developer Tools">Developer Tools</option>
                            <option value="Storage">Storage</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Other">Other</option>
                          </select>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                            {formatAmount(c.cost)}
                          </span>
                          {c.matched && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'
                            }`}>
                              Matched
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`sticky bottom-0 px-6 py-4 border-t flex items-center justify-between ${
            isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => {
                if (step === 'preview' && fileType === 'csv') setStep('mapping')
                else if (step === 'mapping') setStep('upload')
                else handleClose()
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-[#999999] hover:text-white hover:bg-[#111111]'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              <FiArrowLeft className="w-4 h-4" />
              {step === 'upload' ? 'Cancel' : 'Back'}
            </button>

            {step === 'mapping' && (
              <button
                onClick={handleProcessMapping}
                disabled={!nameColumn || !costColumn}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                Continue
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 'preview' && (
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || importing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {selectedCount} Subscription{selectedCount !== 1 ? 's' : ''}
                    <FiCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
