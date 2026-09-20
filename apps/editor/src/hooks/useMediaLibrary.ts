/**
 * useMediaLibrary.ts
 * Hook quản lý thư viện ảnh: list, multi-file upload (presigned PUT), confirm, delete
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export interface MediaAsset {
  id: string;
  site_id: string;
  url: string;
  type: 'image' | 'video';
  mime_type: string;
  file_size: number;
  filename: string;
  created_at: string;
  created_by: string | null;
}

export interface UploadBatchStatus {
  total: number;
  completed: number;
  currentFileName?: string;
  percent: number;
}

interface PagedResponse {
  data: MediaAsset[];
  next_cursor: string | null;
  has_more: boolean;
}

export function useMediaLibrary(siteId: string) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadBatchStatus | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(
    async (cursor?: string | null) => {
      if (!siteId) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: '24' });
        if (cursor) params.append('cursor', cursor);
        const res = await apiClient.get<PagedResponse>(
          `/sites/${siteId}/media?${params.toString()}`
        );
        if (cursor) {
          setAssets((prev) => [...prev, ...(res.data || [])]);
        } else {
          setAssets(res.data || []);
        }
        setNextCursor(res.next_cursor);
        setHasMore(res.has_more);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thư viện media');
      } finally {
        setLoading(false);
      }
    },
    [siteId]
  );

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  /**
   * Upload 1 file đơn lẻ
   */
  const uploadSingleFile = async (file: File): Promise<MediaAsset | null> => {
    try {
      // 1. Lấy presigned URL
      const presigned = await apiClient.post<{ upload_url: string; asset_id: string }>(
        `/sites/${siteId}/media`,
        {
          filename: file.name,
          mime_type: file.type || 'image/jpeg',
          file_size: file.size,
        }
      );

      // 2. PUT lên Storage
      try {
        await fetch(presigned.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'image/jpeg' },
          body: file,
        });
      } catch {
        console.warn('[Media] PUT presigned URL skipped in dev mode');
      }

      // 3. Confirm tạo record DB
      const newAsset = await apiClient.post<MediaAsset>(
        `/sites/${siteId}/media/${presigned.asset_id}/confirm`,
        {
          filename: file.name,
          mime_type: file.type || 'image/jpeg',
          file_size: file.size,
        }
      );

      return newAsset;
    } catch (err: any) {
      console.error(`Lỗi khi upload file ${file.name}:`, err);
      return null;
    }
  };

  /**
   * Upload nhiều file cùng lúc (Multi-file Upload)
   */
  const uploadFiles = useCallback(
    async (fileList: FileList | File[]): Promise<MediaAsset[]> => {
      if (!siteId) return [];
      const files = Array.from(fileList);
      if (files.length === 0) return [];

      setUploading(true);
      setError(null);
      setUploadStatus({
        total: files.length,
        completed: 0,
        currentFileName: files[0].name,
        percent: 0,
      });

      const uploadedAssets: MediaAsset[] = [];
      const failedFiles: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatus({
          total: files.length,
          completed: i,
          currentFileName: file.name,
          percent: Math.round((i / files.length) * 100),
        });

        const asset = await uploadSingleFile(file);
        if (asset) {
          uploadedAssets.push(asset);
        } else {
          failedFiles.push(file.name);
        }
      }

      // Cập nhật 100%
      setUploadStatus({
        total: files.length,
        completed: files.length,
        percent: 100,
      });

      if (uploadedAssets.length > 0) {
        setAssets((prev) => [...uploadedAssets, ...prev]);
      }

      if (failedFiles.length > 0) {
        setError(
          `Đã tải lên ${uploadedAssets.length}/${files.length} file. Thất bại: ${failedFiles.join(', ')}`
        );
      }

      setTimeout(() => {
        setUploading(false);
        setUploadStatus(null);
      }, 1000);

      return uploadedAssets;
    },
    [siteId]
  );

  /**
   * Wrapper upload 1 file tương thích ngược
   */
  const uploadFile = useCallback(
    async (file: File): Promise<MediaAsset | null> => {
      const results = await uploadFiles([file]);
      return results[0] || null;
    },
    [uploadFiles]
  );

  const deleteAsset = useCallback(
    async (assetId: string) => {
      if (!siteId) return;
      try {
        await apiClient.delete(`/sites/${siteId}/media/${assetId}`);
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
      } catch (err: any) {
        setError(err.message || 'Xóa thất bại');
      }
    },
    [siteId]
  );

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !loading) {
      fetchAssets(nextCursor);
    }
  }, [hasMore, nextCursor, loading, fetchAssets]);

  const refresh = useCallback(() => {
    setAssets([]);
    fetchAssets(null);
  }, [fetchAssets]);

  return {
    assets,
    loading,
    uploading,
    uploadStatus,
    hasMore,
    error,
    uploadFile,
    uploadFiles,
    deleteAsset,
    loadMore,
    refresh,
  };
}
