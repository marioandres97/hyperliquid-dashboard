/**
 * Base Repository Interface
 * 
 * Generic repository pattern for type-safe data access
 */

export interface IBaseRepository<T, TCreate, TUpdate> {
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities
   */
  findAll(options?: FindAllOptions): Promise<T[]>;

  /**
   * Create a new entity
   */
  create(data: TCreate): Promise<T>;

  /**
   * Update an existing entity
   */
  update(id: string, data: TUpdate): Promise<T>;

  /**
   * Delete an entity
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count entities
   */
  count(where?: any): Promise<number>;
}

export interface FindAllOptions {
  skip?: number;
  take?: number;
  orderBy?: any;
  where?: any;
}
