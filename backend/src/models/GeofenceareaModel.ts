import { DataTypes, Sequelize, Model, Optional } from 'sequelize';
import { Position } from 'geojson';

/**
 * Interfaccia che implementa lo standard GeoJSON per le coordinate.
 */
interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: Position[][];
}

export interface GeofenceareaAllData {
  geoarea_id: number;
  name: string;
  area: GeoJsonPolygon;
  max_speed: number | null;
  ultima_violazione_valida_id: number;
  created_at: Date;
}

export interface GeofenceareaCreationData extends Omit<Optional<GeofenceareaAllData, 'max_speed' | 'ultima_violazione_valida_id'>, 'geoarea_id' | 'created_at'> { }

export interface CreateGeofenceAreaBody {
  features: [
    {
      properties: {
        name: string;
        max_speed?: number;
      };
      geometry: {
        coordinates: Position[][];
      };
    }
  ];
}

export class Geofencearea extends Model<GeofenceareaAllData, GeofenceareaCreationData> implements GeofenceareaAllData {
  declare geoarea_id: number;
  declare name: string;
  declare area: GeoJsonPolygon;
  declare max_speed: number;
  declare ultima_violazione_valida_id: number;
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
        allowNull: false,
        unique: 'geoarea_name_key'
      },
      area: {
        type: DataTypes.GEOMETRY('POLYGON', 4326),
        allowNull: false
      },
      max_speed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ultima_violazione_valida_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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