import { Transaction } from "sequelize";

export interface InterfacciaDAO<T>{
    create(item: T, t: Transaction): Promise<T>;
    get(item_id1: number, item_id2?: number): Promise<T | null>;
    getAll(): Promise<T[]>; 
    update(item_id: number, item_id2?: number, new_data?: Partial<T>, t?: Transaction): Promise<T | null>;
    delete(item_id1: number, item_id2?: number, t?: Transaction): Promise<T | null>; //visto che item_id2 è facoltativo, sono stato costretto a mettere anche t facoltativo e new_data in update ma nella pratica non lo sarà mai
}