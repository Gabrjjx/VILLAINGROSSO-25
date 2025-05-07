// This file is kept as a placeholder but no storage is needed 
// since the site is static and doesn't use any database operations

export interface IStorage {
  // Empty interface - no storage operations needed for static site
}

export class MemStorage implements IStorage {
  constructor() {
    // Empty constructor
  }
}

export const storage = new MemStorage();
