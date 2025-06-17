export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profilePicture: string | null;
}
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;       // ISO string date
  profilePicture?: string;
  role: string;
  createdAt?: string;          // ISO string date
  skills?: string[];
  profiles?: Profile[]; // Array of Profile objects
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    [key: string]: string | undefined; // to allow other platforms as well
  };  isOnline?: boolean; // Optional field to indicate if the user is currently online
  lastSeen?: Date; // ISO string date to indicate when the user was last seen
bio: string; // Optional field for user biography
department?: string; // Optional field for department or team
location?: string; // Optional field for user location
}
interface Profile {
  userId: number;
  profileId: number;
}