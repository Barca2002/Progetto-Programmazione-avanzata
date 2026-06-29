import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

// Definisce i campi che avrà ogni riga della tabella users
export interface UserAllData {
  user_id: number;
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
  tokens: number;
  created_at: Date;
}

// user_id è autoincrement e is_admin ha un default, is_admin è opzionale e user_id e il timestamp non si possono inserire
export interface UserCreationData extends Omit<Optional<UserAllData, 'is_admin'>, 'user_id' | 'created_at' | 'tokens'> {}

// <Model<UserAllData, UserCreation>>: usa UserAllData per controllare i dati in lettura, e UserCreation per controllare i dati quando creo un nuovo utente (DA SEQUELIZE)
//Voglio ottenere un User definito come <Model<UserAllData, UserCreation>> perche mi servono entrambi: il primo per leggere una qualsiasi row del db e l'altro quando verrà creato nel db
export class User extends Model<UserAllData, UserCreationData> implements UserAllData{
  // Per evitare problemi, dichiariamo gli attributi, così non ci sono campi non dichiarati/non presenti.
  declare user_id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare is_admin: boolean;
  declare tokens: number;
  declare created_at: Date;

  static inizializzaModel(sequelize: Sequelize): typeof User{
    return User.init({
      user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'users_username_key'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: 'users_email_key'
    },
    password: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    tokens: {
      type: DataTypes.DECIMAL(6,3),
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
      }
  }, {
    sequelize, // Istanza di sequelize
    tableName: 'users',
    freezeTableName: true, //serve a dire a sequelize di non pluralizzare il nome della tabella quando lo deduce dal modello
    timestamps: false
  });
  }    
}

