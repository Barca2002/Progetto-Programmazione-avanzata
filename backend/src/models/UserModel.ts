import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

// Definisce i campi che avrà ogni riga della tabella users
export interface UserAllData {
  user_id: number;
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
  created_at: Date;
}

// user_id è autoincrement e is_admin ha un default, is_admin è opzionale e user_id e il timestamp non si possono inserire
export interface UserCreation extends Omit<Optional<UserAllData, 'is_admin'>, 'user_id' | 'created_at'> {}

// <Model<UserAllData, UserCreation>>: usa UserAllData per controllare i dati in lettura, e UserCreation per controllare i dati quando creo un nuovo utente (DA SEQUELIZE)
//Voglio ottenere un UserModel definito come <Model<UserAllData, UserCreation>> perche mi servono entrambi: il primo per leggere una qualsiasi row del db e l'altro quando verrà creato nel db
export class UserModel extends Model<UserAllData, UserCreation> implements UserAllData{

  user_id!: number;
  username!: string;
  email!: string;
  password!: string;
  is_admin!: boolean;
  created_at!: Date;

  static inizializzaModel(sequelize: Sequelize): typeof UserModel{
    return UserModel.init({
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
    sequelize, // Istanza di sequelize
    tableName: 'users',
    freezeTableName: true, //serve a dire a sequelize di non pluralizzare il nome della tabella quando lo deduce dal modello
    createdAt: 'created_at',
    timestamps: false
  });
  }    
}

