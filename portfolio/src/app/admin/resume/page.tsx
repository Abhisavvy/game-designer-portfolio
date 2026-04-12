'use client';

import { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { AdminBreadcrumb } from '@/features/admin/components/AdminBreadcrumb';
import type { ConsistencyIssue } from '@/features/admin/types/admin';

export default function ResumeManagementPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);
  const [exportedData, setExportedData] = useState<any>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setMessage({ type: 'error', text: 'Please upload a JSON file' });
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      const resumeData = JSON.parse(text);

      const response = await fetch('/api/admin/cv-sync/import-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      });

      if (response.ok) {
        const result = await response.json();
        setImportedData(result.extractedInfo);
        setConsistencyIssues(result.consistencyIssues || []);
        setMessage({ type: 'success', text: result.message });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to import resume' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Invalid JSON file or import failed' });
    } finally {
      setImporting(false);
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setMessage({ type: 'error', text: 'Please upload a PDF file' });
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Resume PDF uploaded successfully! It will now be available for download on the CV page.` 
        });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to upload PDF' });
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload PDF resume' });
    } finally {
      setImporting(false);
    }
  };

  const exportResumeData = async () => {
    try {
      setExporting(true);
      
      // Load current personal info and any approved bullets
      let bullets: any[] = [];
      let personalInfo: any = {};
      
      try {
        const personalResponse = await fetch('/api/admin/content/personal');
        if (personalResponse.ok) {
          const personalData = await personalResponse.json();
          personalInfo = personalData.personal || {};
        }
      } catch (error) {
        console.warn('Could not load personal info for export:', error);
      }

      const response = await fetch('/api/admin/cv-sync/export-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets, personalInfo }),
      });

      if (response.ok) {
        const result = await response.json();
        setExportedData(result.resumeData);
        setMessage({ type: 'success', text: result.message });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to export resume' });
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export resume data' });
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async (data: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setMessage({ type: 'success', text: 'JSON copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
    }
  };

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <AdminBreadcrumb />
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Resume Management</h1>
            <p className="text-slate-600">
              Import Reactive Resume JSON to validate consistency, or export portfolio data to Reactive Resume format.
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Import Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Upload className="text-orange-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Import Resume Data</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Upload your Reactive Resume JSON export or PDF resume to validate consistency with your portfolio data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Reactive Resume JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={importing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">For consistency validation</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF Resume
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              disabled={importing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">Store your latest resume PDF</p>
          </div>
        </div>

        {importing && (
          <div className="text-sm text-gray-600 mt-4">
            Processing resume data...
          </div>
        )}
      </div>

      {/* Consistency Issues */}
      {consistencyIssues.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Consistency Issues Found ({consistencyIssues.length})
          </h3>
          
          <div className="space-y-3">
            {consistencyIssues.map((issue, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{issue.field}</h4>
                    <p className="text-sm mt-1">{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-sm mt-2 font-medium">
                        Suggestion: {issue.suggestion}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                    issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                
                {(issue.cvValue || issue.portfolioValue) && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {issue.cvValue && (
                      <div>
                        <span className="font-medium text-gray-700">CV Value:</span>
                        <div className="bg-white bg-opacity-50 p-2 rounded mt-1 font-mono">
                          {issue.cvValue}
                        </div>
                      </div>
                    )}
                    {issue.portfolioValue && (
                      <div>
                        <span className="font-medium text-gray-700">Portfolio Value:</span>
                        <div className="bg-white bg-opacity-50 p-2 rounded mt-1 font-mono">
                          {issue.portfolioValue}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="text-orange-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Export to Reactive Resume</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Generate Reactive Resume JSON from your current portfolio data and approved CV bullets.
        </p>

        <button
          onClick={exportResumeData}
          disabled={exporting}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={20} />
          <span>{exporting ? 'Generating...' : 'Generate Resume JSON'}</span>
        </button>
      </div>

      {/* Export Results */}
      {exportedData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Resume JSON</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(exportedData)}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Copy size={16} />
                <span>Copy</span>
              </button>
              <button
                onClick={() => downloadJSON(exportedData, 'portfolio-resume.json')}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(exportedData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Reactive Resume Integration Guide
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <div>
            <h4 className="font-medium">To Import into Reactive Resume:</h4>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Open Reactive Resume application</li>
              <li>Go to Import/Export section</li>
              <li>Choose &quot;Import from JSON&quot;</li>
              <li>Paste the generated JSON or upload the downloaded file</li>
              <li>Review and adjust the imported data</li>
              <li>Export as PDF when ready</li>
            </ol>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium">To Export from Reactive Resume:</h4>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Open your resume in Reactive Resume</li>
              <li>Go to Import/Export section</li>
              <li>Choose &quot;Export to JSON&quot;</li>
              <li>Download the JSON file</li>
              <li>Upload it here to validate consistency</li>
            </ol>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <ExternalLink size={16} />
            <a 
              href="https://rxresu.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-800 underline"
            >
              Open Reactive Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}