import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorNames } from '../../utils/StatusMessages.js';

dotenv.config();

export class DatabaseConnection {
    private static connDB: DatabaseConnection; //PATTERN SINGLETON: unica istanza di connessione (stesso nome della classe); 
    // static: ne esiste solo una per tutta la classe, quindi se la chiamo sono sicuro di usare questa e non crearne un'altra 
    private connection: Sequelize; //connessione di tipo Sequelize
    
    private constructor() {
      const {
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_USER,
        DB_PASSWORD,
      } = process.env;

      if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
        throw ErrorFactory.getError(AppErrorNames.ENV_VARIABLES_MISSING);
      }

      this.connection = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: process.env.DB_HOST!,
        port: parseInt(DB_PORT)!, //vuole per forza che lo parso ad int
        dialect: 'mysql'
      });
	}

  public static connect(): Sequelize {
      if (!DatabaseConnection.connDB) { //se non esiste la crea
          DatabaseConnection.connDB = new DatabaseConnection();
      }
      return DatabaseConnection.connDB.connection; //torna la connessione attiva
  }
      
} 