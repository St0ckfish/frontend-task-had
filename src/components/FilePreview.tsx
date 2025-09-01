'use client';

import { useState } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  FileArchive, 
  File,
  Music,
  Code,
  FileCode,
} from 'lucide-react';
import { Button } from './ui/button';

interface FilePreviewProps {
  fileName: string;
  filePath?: string;
  className?: string;
}

function getFileIcon(fileName: string, size = 'w-8 h-8') {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'bmp':
    case 'ico':
      return <Image className={`${size} text-primary`} />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'mkv':
    case 'webm':
    case 'flv':
    case 'wmv':
      return <Video className={`${size} text-purple-600 dark:text-purple-400`} />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'wma':
      return <Music className={`${size} text-green-600 dark:text-green-400`} />;
    case 'pdf':
      return <FileText className={`${size} text-red-600 dark:text-red-400`} />;
    case 'doc':
    case 'docx':
    case 'txt':
    case 'md':
    case 'rtf':
      return <FileText className={`${size} text-blue-600 dark:text-blue-400`} />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
      return <FileArchive className={`${size} text-orange-600 dark:text-orange-400`} />;
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'scss':
    case 'json':
    case 'xml':
      return <Code className={`${size} text-yellow-600 dark:text-yellow-400`} />;
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'php':
    case 'rb':
    case 'go':
    case 'rs':
      return <FileCode className={`${size} text-indigo-600 dark:text-indigo-400`} />;
    default:
      return <File className={`${size} text-muted-foreground`} />;
  }
}

function isImageFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(extension || '');
}

function isVideoFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(extension || '');
}

export function FilePreview({ fileName, filePath, className }: FilePreviewProps) {
  const [previewError, setPreviewError] = useState(false);
  
  const fullPath = filePath ? `/${filePath}` : `/${fileName}`;
  const isImage = isImageFile(fileName);
  const isVideo = isVideoFile(fileName);
  const showThumbnail = (isImage || isVideo) && !previewError;

  return (
    <div className={`group relative ${className}`}>
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        {showThumbnail ? (
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex items-center justify-center">
            {isImage ? (
              <img
                src={fullPath}
                alt={fileName}
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
                loading="lazy"
              />
            ) : isVideo ? (
              <video
                src={fullPath}
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
                muted
                preload="metadata"
              />
            ) : null}
            {previewError && getFileIcon(fileName, 'w-6 h-6 sm:w-8 sm:h-8')}
          </div>
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center">
            {getFileIcon(fileName, 'w-6 h-6 sm:w-8 sm:h-8')}
          </div>
        )}
        
        <span className="text-xs sm:text-sm font-medium text-center truncate w-full max-w-[80px] sm:max-w-[120px] text-foreground">
          {fileName}
        </span>
      </div>
      
      {isImage && !previewError && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-50 bg-popover border border-border rounded-lg shadow-lg p-2">
            <img
              src={fullPath}
              alt={fileName}
              className="max-w-[150px] sm:max-w-[200px] max-h-[150px] sm:max-h-[200px] object-contain rounded"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FileCard({ fileName, filePath, onClick }: FilePreviewProps & { onClick?: () => void }) {
  const fullPath = filePath ? `/${filePath}` : `/${fileName}`;
  
  return (
    <Button
      variant="outline"
      className="h-auto w-full hover:bg-accent hover:border-accent-foreground/20 transition-all relative group"
      onClick={onClick}
      asChild
    >
      <a
        href={fullPath}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <FilePreview fileName={fileName} filePath={filePath} />
       
      </a>
    </Button>
  );
}
