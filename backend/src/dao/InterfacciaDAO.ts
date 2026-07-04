import { Transaction } from "sequelize";

export interface InterfacciaDAO<T>{
    create(item: T, t?: Transaction): Promise<T>;
    get(id: number): Promise<T | null>;
    getAll(): Promise<T[]>; 
    update(id: number, new_data: Partial<T>, t?: Transaction): Promise<T | null>;
    //delete(id: number, t?: Transaction): Promise<T | null>;
}