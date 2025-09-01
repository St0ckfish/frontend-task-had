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
      <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-accent/50 transition-all duration-200 group-hover:scale-105">
        {showThumbnail ? (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
            {isImage ? (
              <img
                src={fullPath}
                alt={fileName}
                className="w-full h-full object-cover rounded-md"
                onError={() => setPreviewError(true)}
                loading="lazy"
              />
            ) : isVideo ? (
              <video
                src={fullPath}
                className="w-full h-full object-cover rounded-md"
                onError={() => setPreviewError(true)}
                muted
                preload="metadata"
              />
            ) : null}
            {previewError && getFileIcon(fileName, 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12')}
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg flex items-center justify-center">
            {getFileIcon(fileName, 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12')}
          </div>
        )}
        
        <span className="text-xs sm:text-sm md:text-base font-medium text-center text-foreground leading-tight max-w-full break-words">
          {fileName}
        </span>
      </div>
      
      {isImage && !previewError && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-popover border border-border rounded-lg shadow-lg p-2">
            <img
              src={fullPath}
              alt={fileName}
              className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px] max-h-[200px] sm:max-h-[250px] md:max-h-[300px] object-contain rounded"
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
    <div className="relative group">
      <a
        href={fullPath}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
        onClick={onClick}
      >
        <FilePreview fileName={fileName} filePath={filePath} />
      </a>
    </div>
  );
}
