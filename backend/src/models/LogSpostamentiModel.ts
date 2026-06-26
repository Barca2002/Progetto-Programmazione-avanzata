import { DataTypes, Sequelize, Model } from 'sequelize';
export interface LogSpostamentiAllData {
  id: number;
  mmsi: number;
  geoarea_id: number;
  spostamento: string;
  created_at: Date;
}

export interface LogSpostamentiCreationData extends Omit<LogSpostamentiAllData, 'id' | 'created_at'> {}
export class LogSpostamenti extends Model {
  declare id: number;
  declare mmsi: number;
  declare geoarea_id: number;
  declare spostamento: string;
  declare created_at: Date;


  static inizializzaModel(sequelize: Sequelize): typeof LogSpostamenti {
    return LogSpostamenti.init({
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      mmsi: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      geoarea_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      spostamento: {
        type: DataTypes.ENUM("ENTRATA", "USCITA"),
        allowNull: false
      },
      created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      tableName: 'log_spostamenti',
      freezeTableName: true,
      timestamps: false
    });
  }
}