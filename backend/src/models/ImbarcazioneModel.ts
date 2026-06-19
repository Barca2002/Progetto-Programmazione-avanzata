import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

export interface ImbarcazioneAllData {
  mmsi: number;
  name: string;
  type: string;
  created_at: Date;
}

export interface ImbarcazioneCreationData extends Omit<Optional<ImbarcazioneAllData, 'mmsi'>,'created_at'> {}


export class Imbarcazione extends Model<ImbarcazioneAllData, ImbarcazioneCreationData> implements ImbarcazioneAllData {
  declare mmsi: number;
  declare name: string;
  declare type: string;
  declare created_at: Date;


  static inizializzaModel(sequelize: Sequelize): typeof Imbarcazione {
    return Imbarcazione.init({
      mmsi: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      tableName: 'imbarcazioni',
      freezeTableName: true,
      timestamps: false
    });
  }
}