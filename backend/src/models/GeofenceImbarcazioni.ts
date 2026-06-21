import { DataTypes, Sequelize, Model } from 'sequelize';

export class GeofenceImbarcazioni extends Model {
  declare geoarea_id: number;
  declare mmsi: number;
  declare is_in: boolean;
  declare is_out: boolean;

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
        defaultValue: false //vedi con Alessio se lasciarlo false o metterlo a true
      },
      is_out: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false //vedi con Alessio se lasciarlo false o metterlo a true
      }
    }, {
      sequelize,
      tableName: 'geofence_imbarcazioni',
      freezeTableName: true,
      timestamps: false
    });
  }
}