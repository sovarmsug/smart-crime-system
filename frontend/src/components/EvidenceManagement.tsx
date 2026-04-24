import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  SpeakerWaveIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ShareIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface EvidenceFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  tags: string[];
  isVerified: boolean;
  caseId?: string;
  metadata: {
    duration?: number;
    dimensions?: { width: number; height: number };
    format: string;
    location?: string;
    device?: string;
  };
}

interface EvidenceManagementProps {
  className?: string;
  caseId?: string;
  onFileSelect?: (files: EvidenceFile[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
}

const EvidenceManagement: React.FC<EvidenceManagementProps> = ({
  className,
  caseId,
  onFileSelect,
  maxFiles = 10,
  allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc,.docx,.txt']
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [filterType, setFilterType] = useState<string>('all');
  const [showPreview, setShowPreview] = useState<EvidenceFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <PhotoIcon className="h-6 w-6" />;
      case 'video': return <VideoCameraIcon className="h-6 w-6" />;
      case 'audio': return <SpeakerWaveIcon className="h-6 w-6" />;
      case 'document': return <DocumentIcon className="h-6 w-6" />;
      default: return <DocumentTextIcon className="h-6 w-6" />;
    }
  };

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const generateThumbnail = async (file: File): Promise<string | null> => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.currentTime = 1;
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };
      });
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const fileId = `file-${Date.now()}-${Math.random()}`;
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const thumbnail = await generateThumbnail(file);
      
      const evidenceFile: EvidenceFile = {
        id: fileId,
        name: file.name,
        type: getFileType(file),
        size: file.size,
        url: URL.createObjectURL(file),
        thumbnailUrl: thumbnail || undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy: `${user?.first_name} ${user?.last_name}` || 'Anonymous',
        tags: [],
        isVerified: false,
        caseId,
        metadata: {
          format: file.type,
          location: 'Kampala, Uganda', // Would get from GPS
          device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
        }
      };

      // Add video duration if applicable
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = evidenceFile.url;
        video.onloadedmetadata = () => {
          evidenceFile.metadata.duration = video.duration;
          setFiles(prev => [...prev, evidenceFile]);
        };
      }

      // Add image dimensions if applicable
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = evidenceFile.url;
        img.onload = () => {
          evidenceFile.metadata.dimensions = { width: img.width, height: img.height };
          setFiles(prev => [...prev, evidenceFile]);
        };
      }

      setFiles(prev => [...prev, evidenceFile]);
      toast.success(`${file.name} uploaded successfully`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 100 * 1024 * 1024) { // 100MB limit
      toast.error('Total file size exceeds 100MB limit');
      return;
    }

    setUploading(true);
    Promise.all(fileArray.map(file => uploadFile(file)))
      .finally(() => setUploading(false));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const deleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Revoke object URL to free memory
    URL.revokeObjectURL(file.url);
    if (file.thumbnailUrl) {
      URL.revokeObjectURL(file.thumbnailUrl);
    }

    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    toast.success('File deleted');
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const shareFiles = async (fileIds: string[]) => {
    const filesToShare = files.filter(f => fileIds.includes(f.id));
    
    if (filesToShare.length === 0) {
      toast.error('No files selected');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Evidence Files',
          text: `Sharing ${filesToShare.length} evidence files`,
          files: filesToShare.map(f => new File([], f.name, { type: f.metadata.format }))
        });
      } else {
        // Fallback: copy URLs to clipboard
        const urls = filesToShare.map(f => f.url).join('\n');
        await navigator.clipboard.writeText(urls);
        toast.success('File links copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share files');
    }
  };

  const downloadFile = (file: EvidenceFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started');
  };

  const filteredAndSortedFiles = files
    .filter(file => filterType === 'all' || file.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return b.size - a.size;
        case 'type': return a.type.localeCompare(b.type);
        case 'date': return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        default: return 0;
      }
    });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Evidence Management</h2>
        
        <div
          ref={dropZoneRef}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">
            Drag and drop files here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: Images, videos, audio, documents (Max {maxFiles} files, 100MB total)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Uploading...</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File Controls */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FolderIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <DocumentTextIcon className="h-5 w-5" />
                </button>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedFiles.length} selected
              </span>
              {selectedFiles.length > 0 && (
                <>
                  <button
                    onClick={() => shareFiles(selectedFiles)}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      selectedFiles.forEach(deleteFile);
                      setSelectedFiles([]);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* File Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                  selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <div>
                    <div className="aspect-square bg-gray-100 relative">
                      {file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* File Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          {file.type}
                        </span>
                      </div>

                      {/* Verified Badge */}
                      {file.isVerified && (
                        <div className="absolute bottom-2 right-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => setShowPreview(file)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(file)}
                          className="p-1 text-gray-500 hover:text-green-600"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="p-4 flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-shrink-0">
                      {file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.type}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        {file.isVerified && (
                          <span className="text-green-600 flex items-center">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPreview(file)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadFile(file)}
                        className="p-1 text-gray-500 hover:text-green-600"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-screen overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{showPreview.name}</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Preview based on file type */}
              {showPreview.type === 'image' && (
                <img
                  src={showPreview.url}
                  alt={showPreview.name}
                  className="max-w-full h-auto"
                />
              )}
              {showPreview.type === 'video' && (
                <video
                  src={showPreview.url}
                  controls
                  className="max-w-full h-auto"
                />
              )}
              {showPreview.type === 'audio' && (
                <audio src={showPreview.url} controls className="w-full" />
              )}
              
              {/* File Metadata */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Size:</span>
                  <span className="ml-2 text-gray-600">{formatFileSize(showPreview.size)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-600">{showPreview.metadata.format}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Uploaded:</span>
                  <span className="ml-2 text-gray-600">{new Date(showPreview.uploadedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">By:</span>
                  <span className="ml-2 text-gray-600">{showPreview.uploadedBy}</span>
                </div>
                {showPreview.metadata.dimensions && (
                  <div>
                    <span className="font-medium text-gray-700">Dimensions:</span>
                    <span className="ml-2 text-gray-600">
                      {showPreview.metadata.dimensions.width} × {showPreview.metadata.dimensions.height}
                    </span>
                  </div>
                )}
                {showPreview.metadata.duration && (
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">
                      {Math.floor(showPreview.metadata.duration / 60)}:{(showPreview.metadata.duration % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                )}
                {showPreview.metadata.location && (
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{showPreview.metadata.location}</span>
                  </div>
                )}
                {showPreview.metadata.device && (
                  <div>
                    <span className="font-medium text-gray-700">Device:</span>
                    <span className="ml-2 text-gray-600">{showPreview.metadata.device}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceManagement;
