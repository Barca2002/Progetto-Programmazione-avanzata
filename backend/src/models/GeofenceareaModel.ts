import { DataTypes, Sequelize, Model } from 'sequelize';


interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeofenceareaAllData {
  geoarea_id: number;
  name: string;
  area: GeoJsonPolygon;
  created_at: Date;
}

export interface GeofenceareaCreationData extends Omit<GeofenceareaAllData, 'geoarea_id' | 'created_at'> {}

export class Geofencearea extends Model<GeofenceareaAllData, GeofenceareaCreationData> implements GeofenceareaAllData {
  declare geoarea_id: number;
  declare name: string;
  declare area: GeoJsonPolygon;
  declare created_at: Date;

  static inizializzaModel(sequelize: Sequelize): typeof Geofencearea {
    return Geofencearea.init({
      geoarea_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      area: {
        // Sequelize mappa GEOMETRY('POLYGON', 4326) sul tipo PostGIS geometry(Polygon,4326)
        type: DataTypes.GEOMETRY('POLYGON', 4326),
        allowNull: false
      },
      created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      }
    }, {
      sequelize,
      tableName: 'geofence_areas',
      freezeTableName: true,
      timestamps: false
    });
  }
}