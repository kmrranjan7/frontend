export const qualifications = [
  "Below 10th Pass",
  "10th Pass",
  "12th Pass",
  "ITI",
  "Diploma",
  "Graduate",
  "B.E./B.Tech",
  "Post Graduate",
  "M.E./M.Tech",
  "MBA/PGDM",
  "CA/CS/ICWA",
  "B.Ed",
  "M.Ed",
  "LLB",
  "LLM",
  "MBBS",
  "MD/MS",
  "PhD",
  "Any Graduate",
  "Other",
] as const;

export type Qualification = (typeof qualifications)[number];
