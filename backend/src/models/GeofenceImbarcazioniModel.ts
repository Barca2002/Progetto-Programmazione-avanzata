import { DataTypes, Sequelize, Model } from 'sequelize';

// Questo model rappresenta la molti a molti tra le geofencearea e le imbarcazioni
export class GeofenceImbarcazioni extends Model {
  declare geoarea_id: number;
  declare mmsi: number;

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
      }
    }, {
      sequelize,
      tableName: 'geofence_imbarcazioni',
      freezeTableName: true,
      timestamps: false
    });
  }
}