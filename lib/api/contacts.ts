import { env } from "@/config/env";

export type ContactItem = Readonly<{
  id: string;
  fullName: string;
  email: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
  createdAt: string;
}>;

export type ContactPage = Readonly<{
  content: readonly ContactItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
  first: boolean;
  last: boolean;
}>;

type ContactApiResponse = Readonly<{
  success: boolean;
  message: string;
  data: ContactPage;
}>;

export async function fetchContacts({
  page = 0,
  size = 20,
  sortDir = "desc",
}: {
  page?: number;
  size?: number;
  sortDir?: "asc" | "desc";
}): Promise<ContactPage> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy: "createdAt",
    sortDir,
  });
  const response = await fetch(`${env.backendApiUrl}/api/contact?${query}`, {
    next: { revalidate: 30, tags: ["contacts"] },
  });
  const payload = await response.json() as ContactApiResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Unable to load contacts.");
  }

  return payload.data;
}
