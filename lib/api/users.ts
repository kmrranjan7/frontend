import { env } from "@/config/env";

export type UserDetails = Readonly<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}>;

export type UserPage = Readonly<{
  content: readonly UserDetails[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
  first: boolean;
  last: boolean;
}>;

type UserApiResponse = Readonly<{
  success: boolean;
  message: string;
  data: UserPage;
}>;

export async function fetchUsers(page = 0, size = 20): Promise<UserPage> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  const response = await fetch(`${env.backendApiUrl}/api/v1/users?${query}`, {
    cache: "no-store",
  });
  const payload = await response.json() as UserApiResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Unable to load users.");
  }

  return payload.data;
}
