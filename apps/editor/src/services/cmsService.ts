import {
  ContentTypeDTO,
  ContentTypeInputDTO,
  ContentItemDTO,
  PagedResponse,
  ContentItemStatus,
} from '@t-business/shared-types';
import { apiClient } from './apiClient';
import { useCanvasStore } from '../store/canvasStore';

function getEffectiveSiteId(passedSiteId?: string): string {
  if (passedSiteId && passedSiteId.trim()) {
    return passedSiteId;
  }
  const activeSiteId = useCanvasStore.getState().siteId;
  return activeSiteId || '6afeff8e-4fd9-4df7-8f49-eff1e558cd3f';
}

export const cmsService = {
  // ==========================================
  // CONTENT TYPES
  // ==========================================
  async getContentTypes(siteId?: string): Promise<ContentTypeDTO[]> {
    const targetSiteId = getEffectiveSiteId(siteId);
    return apiClient.get<ContentTypeDTO[]>(`/sites/${targetSiteId}/content-types`);
  },

  async createContentType(
    siteId: string | undefined,
    data: ContentTypeInputDTO
  ): Promise<ContentTypeDTO> {
    const targetSiteId = getEffectiveSiteId(siteId);
    return apiClient.post<ContentTypeDTO>(`/sites/${targetSiteId}/content-types`, data);
  },

  async updateContentType(
    siteId: string | undefined,
    typeId: string,
    data: Partial<ContentTypeInputDTO>
  ): Promise<ContentTypeDTO> {
    const targetSiteId = getEffectiveSiteId(siteId);
    return apiClient.patch<ContentTypeDTO>(`/sites/${targetSiteId}/content-types/${typeId}`, data);
  },

  async deleteContentType(
    siteId: string | undefined,
    typeId: string
  ): Promise<void> {
    const targetSiteId = getEffectiveSiteId(siteId);
    return apiClient.delete(`/sites/${targetSiteId}/content-types/${typeId}`);
  },

  // ==========================================
  // CONTENT ITEMS
  // ==========================================
  async getContentItems(
    siteId: string | undefined,
    typeId: string,
    status?: ContentItemStatus
  ): Promise<PagedResponse<ContentItemDTO>> {
    const targetSiteId = getEffectiveSiteId(siteId);
    const params = new URLSearchParams({ limit: '50' });
    if (status) params.set('status', status);
    return apiClient.get<PagedResponse<ContentItemDTO>>(
      `/sites/${targetSiteId}/content-types/${typeId}/items?${params}`
    );
  },

  async createContentItem(
    siteId: string | undefined,
    typeId: string,
    fields: Record<string, unknown>,
    status: ContentItemStatus = 'published'
  ): Promise<ContentItemDTO> {
    const targetSiteId = getEffectiveSiteId(siteId);
    return apiClient.post<ContentItemDTO>(
      `/sites/${targetSiteId}/content-types/${typeId}/items`,
      { fields, status }
    );
  },

  async updateContentItem(
    siteId: string | undefined,
    typeId: string,
    itemId: string,
    fields: Record<string, unknown>,
    status?: ContentItemStatus
  ): Promise<ContentItemDTO> {
    const targetSiteId = getEffectiveSiteId(siteId);
    return apiClient.patch<ContentItemDTO>(
      `/sites/${targetSiteId}/content-types/${typeId}/items/${itemId}`,
      { fields, status }
    );
  },

  async deleteContentItem(
    siteId: string | undefined,
    typeId: string,
    itemId: string
  ): Promise<void> {
    const targetSiteId = getEffectiveSiteId(siteId);
    return apiClient.delete(`/sites/${targetSiteId}/content-types/${typeId}/items/${itemId}`);
  },
};
