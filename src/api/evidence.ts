import apiClient from "./client";

export interface EvidenceUploadResult {
  path: string;
  url: string;
  name: string;
  size: number;
  mime: string;
}

export const evidenceApi = {
  upload: (auditId: string, file: File, extraPath = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (extraPath) formData.append("path", extraPath);
    return apiClient.post<EvidenceUploadResult>(`/audits/${auditId}/evidence`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
};
