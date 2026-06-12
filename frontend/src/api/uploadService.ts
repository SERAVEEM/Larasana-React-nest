import { client } from './client';

/**
 * Upload an image file to R2 via the backend upload endpoint.
 * Returns the public R2 URL of the uploaded image.
 */
export const uploadImageAsync = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // 30s timeout for large files
  });

  return response.data.url;
};
