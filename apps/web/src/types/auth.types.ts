export interface SignUpResponse {
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}