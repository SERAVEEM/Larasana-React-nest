import type { AxiosInstance } from 'axios';
import { client } from '../../api/client';

export abstract class BaseService {
  protected readonly http: AxiosInstance;

  constructor() {
    this.http = client;
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.http.get<T>(url, { params });
    return response.data;
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.http.post<T>(url, data);
    return response.data;
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.http.put<T>(url, data);
    return response.data;
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.http.delete<T>(url);
    return response.data;
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.http.patch<T>(url, data);
    return response.data;
  }
}
