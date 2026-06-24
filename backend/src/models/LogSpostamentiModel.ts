import { DataTypes, Sequelize, Model } from 'sequelize';

export class LogSpostamenti extends Model {
  declare id: number;
  declare mmsi: number;
  declare geoarea_id: string;
  declare spostamento: string;
  declare created_at: Date;


  static inizializzaModel(sequelize: Sequelize): typeof LogSpostamenti {
    return LogSpostamenti.init({
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
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
        type: DataTypes.STRING(10),
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