import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
import { DatabaseConnection } from '../patterns/singleton/DBConnection.js';

const db: Sequelize = DatabaseConnection.connect()  //Mi connetto al db

// Definisce i campi che avrà ogni riga della tabella users
export interface UserAllData {
  user_id: number;
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
  created_at: Date;
}

// userId è autoincrement e isAdmin ha un default, idAdmin è opzionale e userId non si può inserire
export interface UserCreation extends Omit<Optional<UserAllData, 'is_admin'>, 'user_id'> {}

// <Model<UserAllData, UserCreation>>: usa UserAllData per controllare i dati in lettura, e UserCreation per controllare i dati quando creo un nuovo utente
export const UserModel = db.define<Model<UserAllData, UserCreation>>('users', { //Voglio ottenere un UserModel definito come <Model<UserAllData, UserCreation>> perche mi servono entrambi: il primo per leggere una qualsiasi row del db e l'altro quando verrà creato nel db
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
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  freezeTableName: true, //serve a dire a sequalize di non pluralizzare il nome della tabella quando lo deduce dal modello
  timestamps: false
});

export default UserModel;