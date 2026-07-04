import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

export interface UserAllData {
  user_id: number;
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
  tokens: number;
  created_at: Date;
}

export interface UserCreationData extends Omit<Optional<UserAllData, 'is_admin'>, 'user_id' | 'created_at' | 'tokens'> { }

export interface UserUpdateData extends Omit<Optional<UserAllData, 'is_admin' | 'tokens' | 'created_at'>, 'user_id'> { }

export interface UpdateTokenBody {
  email: string;
  newTokenAmount: number;
}

export interface TokenPayload {
  user_id: number;
  email: string;
  is_admin: boolean;
  iat: number;
  exp: number;
}

export class User extends Model<UserAllData, UserCreationData> implements UserAllData {

  declare user_id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare is_admin: boolean;
  declare tokens: number;
  declare created_at: Date;

  static inizializzaModel(sequelize: Sequelize): typeof User {
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
        type: DataTypes.DECIMAL(6, 3),
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      tableName: 'users',
      freezeTableName: true,
      timestamps: false
    });
  }
}

