// lib/users.ts
export interface User {
  name: string;
  email: string;
}

export const users: User[] = [
  { name: "Petar", email: "petar.dimitrov@sap.com" },
  { name: "Radoslav", email: "radoslav.ivanov02@sap.com" },
  { name: "Mihail", email: "mihail.statelov@sap.com" },
  { name: "Georgi", email: "georgi.georgiev03@sap.com" },
  { name: "Jordan", email: "jordan.ivanov@sap.com" },
  { name: "Konstantin", email: "konstantin.polihronov@sap.com" },
];

/** Flat list of user names (for backward compatibility) */
export const userNames = users.map((u) => u.name);
