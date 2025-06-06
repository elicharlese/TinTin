"use client"

import type React from "react"

import { useState } from "react"
import { Download, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DataExportImport() {
  const { exportData, importData } = useBudgetStore()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = () => {
    try {
      const data = exportData()
      if (!data) {
        toast({
          variant: "destructive",
          title: "Export failed",
          description: "Failed to export data",
        })
        return
      }

      // Create a blob and download it
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `budget-tracker-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your data has been exported successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "An error occurred while exporting data",
      })
    }
  }

  const handleImport = async () => {
    try {
      setImportError(null)

      if (!importFile) {
        setImportError("Please select a file to import")
        return
      }

      // Read the file
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          const success = importData(data)

          if (success) {
            setIsImportDialogOpen(false)
            setImportFile(null)
            toast({
              title: "Import successful",
              description: "Your data has been imported successfully",
            })
          } else {
            setImportError("Failed to import data. The file may be corrupted or in an invalid format.")
          }
        } catch (error) {
          setImportError("Failed to parse the import file. Please make sure it's a valid JSON file.")
        }
      }

      reader.onerror = () => {
        setImportError("Failed to read the import file")
      }

      reader.readAsText(importFile)
    } catch (error) {
      setImportError("An unexpected error occurred during import")
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)} className="flex items-center">
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </Button>
      </div>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Import your budget data from a JSON file. This will replace all your current data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="import-file">Select File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false)
                  setImportFile(null)
                  setImportError(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}

function Input({
  id,
  type,
  accept,
  onChange,
}: { id: string; type: string; accept?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      id={id}
      type={type}
      accept={accept}
      onChange={onChange}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}

