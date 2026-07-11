import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  newsletter?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  needs_verification?: boolean;
  email?: string;
}

export interface RegisterResponse {
  message?: string;
  needs_verification?: boolean;
  email?: string;
  user?: unknown;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<RegisterResponse>("/auth/register", payload).then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient.post<VerifyOtpResponse>("/auth/verify-otp", payload).then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<{ message: string }>("/auth/reset-password", payload).then((r) => r.data),

  me: () => apiClient.get<unknown>("/auth/me").then((r) => r.data),

  logout: () => apiClient.post("/auth/logout").then((r) => r.data),

  refresh: () => apiClient.post<AuthResponse>("/auth/refresh").then((r) => r.data),

  sendPasswordOtp: () =>
    apiClient.post<{ message: string }>("/auth/send-password-otp").then((r) => r.data),

  changePassword: (payload: { otp: string; password: string; password_confirmation: string }) =>
    apiClient.post<{ message: string }>("/auth/change-password", payload).then((r) => r.data),

  sendChangeEmailOtp: (newEmail: string) =>
    apiClient.post<{ message: string }>("/auth/send-change-email-otp", { new_email: newEmail }).then((r) => r.data),

  sendNewEmailOtp: (newEmail: string, otp: string) =>
    apiClient.post<{ message: string }>("/auth/send-new-email-otp", { new_email: newEmail, otp }).then((r) => r.data),

  verifyChangeEmail: (newEmail: string, otp: string) =>
    apiClient.post<{ message: string; old_email: string; new_email: string }>("/auth/verify-change-email", { new_email: newEmail, otp }).then((r) => r.data),

  updateName: (fullName: string) =>
    apiClient.put<{ message: string; full_name: string }>("/auth/name", { full_name: fullName }).then((r) => r.data),
};
