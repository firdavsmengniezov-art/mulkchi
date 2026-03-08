export interface SavedSearch {
  id: string;
  name: string;
  searchQuery: string;
  notifyOnMatch: boolean;
  userId: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
