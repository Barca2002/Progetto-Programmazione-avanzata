import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';

dotenv.config();

export class DatabaseConnection {
    private static connDB: DatabaseConnection; //PATTERN SINGLETON: unica istanza di connessione (attributo statico con lo stesso tipo della classe); 
    private connection: Sequelize; //connessione con ORM Sequelize
    
    private constructor() {
      const {
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_USER,
        DB_PASSWORD,
      } = process.env;
      // I parametri della connessione devono essere presenti nel .env
      if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
        throw ErrorFactory.getError(AppErrorEnum.ENV_VARIABLES_MISSING);
      }
      // Istanziamo la connessione con Sequelize
      this.connection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST!,
        port: Number(DB_PORT)!,
        dialect: 'postgres'
      });
	}

  public static connect(): Sequelize {
      if (!DatabaseConnection.connDB) { //se non esiste la connessione la crea
          DatabaseConnection.connDB = new DatabaseConnection();
      }
      return DatabaseConnection.connDB.connection; //torna la connessione attiva
  }
      
} 