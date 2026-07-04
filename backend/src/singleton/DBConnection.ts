import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';

dotenv.config();

export class DatabaseConnection {
  /**
   * La connessione al db è implementata tramite il pattern singleton, così abbiamo una sola istanza per interagirvi.
   */
    private static connDB: DatabaseConnection; 
    private readonly instance: Sequelize;
    
    private constructor() {
      const {
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_USER,
        DB_PASSWORD,
      } = process.env;
  
      if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
        throw ErrorFactory.getError(AppErrorEnum.ENV_VARIABLES_MISSING);
      }

      this.instance = new Sequelize(
        {
          database: DB_NAME || "db_app",
          username: DB_USER || "postgres",
          password: DB_PASSWORD || "",
          host: DB_HOST || "localhost",
          port: Number(DB_PORT) || 5432,
          dialect: 'postgres',
          timezone: 'Europe/Rome'
      });
	}

  public static getInstance(): Sequelize {

      if (!DatabaseConnection.connDB) { 
          DatabaseConnection.connDB = new DatabaseConnection();
      }
      return DatabaseConnection.connDB.instance;
  }
      
} 