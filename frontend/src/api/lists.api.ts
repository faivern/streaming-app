import api from "./http/axios";
import type { List } from "../types/list";

export type CreateListRequest = {
  name: string;
  description?: string;
  isPublic: boolean;
};

export type UpdateListRequest = {
  name?: string;
  description?: string;
  isPublic?: boolean;
};

export type AddListItemRequest = {
  tmdbId: number;
  mediaType: string;
  title?: string;
  posterPath?: string;
};

export const listsApi = {
  getUserLists: async (): Promise<List[]> => {
    const res = await api.get<List[]>("/api/list");
    return res.data;
  },

  getById: async (id: number): Promise<List> => {
    const res = await api.get<List>(`/api/list/${id}`);
    return res.data;
  },

  create: async (data: CreateListRequest): Promise<List> => {
    const res = await api.post<List>("/api/list", data);
    return res.data;
  },

  update: async (id: number, data: UpdateListRequest): Promise<List> => {
    const res = await api.put<List>(`/api/list/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/list/${id}`);
  },

  addItem: async (listId: number, item: AddListItemRequest): Promise<List> => {
    const res = await api.post<List>(`/api/list/${listId}/items`, item);
    return res.data;
  },

  removeItem: async (listId: number, itemId: number): Promise<void> => {
    await api.delete(`/api/list/${listId}/items/${itemId}`);
  },
};

export default listsApi;
