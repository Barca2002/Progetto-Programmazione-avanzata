import { DataTypes, Sequelize, Model } from 'sequelize';

export class GeofenceImbarcazioni extends Model {
  declare geoarea_id: number;
  declare mmsi: number;
  declare is_in: boolean;

  static inizializzaModel(sequelize: Sequelize): typeof GeofenceImbarcazioni {
    return GeofenceImbarcazioni.init({
      geoarea_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      mmsi: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      is_in: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      sequelize,
      tableName: 'geofence_imbarcazioni',
      freezeTableName: true,
      timestamps: false
    });
  }
}