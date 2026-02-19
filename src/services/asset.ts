import axios from 'axios';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const uploadImage = async (
    file: File,
    userId: string,
    folderId: string,
    token: string
): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('folderId', folderId);

    try {
        const response = await axios.post(`${API_URL}/assets/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });

        if (response.data && response.data.url) {
            return response.data.url;
        } else {
            throw new Error('Upload failed: No URL returned');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Asset upload error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to upload image');
        }
        throw error;
    }
};
