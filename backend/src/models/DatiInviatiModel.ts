import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

export interface DatiinviatiAllData {
  id: number;
  mmsi: number;
  latitudine: number;
  longitudine: number;
  velocita_kmh: number;
  created_at: number;
  stato: string;
}

export interface DatiinviatiCreationData extends Omit<Optional<DatiinviatiAllData, 'id' | 'created_at'>, never> {}

export class Datiinviati extends Model<DatiinviatiAllData, DatiinviatiCreationData> implements DatiinviatiAllData {
  declare id: number;
  declare mmsi: number;
  declare latitudine: number;
  declare longitudine: number;
  declare velocita_kmh: number;
  declare created_at: number;
  declare stato: string;

  static inizializzaModel(sequelize: Sequelize): typeof Datiinviati {
    return Datiinviati.init({
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      mmsi: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      latitudine: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false
      },
      longitudine: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false
      },
      velocita_kmh: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false
      },
      created_at: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: Date.now() //formato linux epoch
      },
      stato: {
        type: DataTypes.ENUM("IN NAVIGAZIONE", "IN PESCA", "STAZIONARIA"),
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'dati_inviati',
      freezeTableName: true,
      timestamps: false
    });
  }
}