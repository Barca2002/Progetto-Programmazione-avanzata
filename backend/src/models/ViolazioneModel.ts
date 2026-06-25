import { DataTypes, Sequelize, Model } from 'sequelize';

export interface ViolazioneAllData {
    id: number;
    mmsi: number;
    geoarea_id: number;
    tipo: 'ECCESSO VELOCITA'| 'ACCESSO AREA NON AUTORIZZATA';
    created_at: Date;
}

export interface ViolazioneCreationData extends Omit<ViolazioneAllData, 'id' |'created_at'> {}


export class Violazione extends Model<ViolazioneAllData, ViolazioneCreationData> implements ViolazioneAllData {
    declare id: number;
    declare mmsi: number;
    declare geoarea_id: number;
    declare tipo: 'ECCESSO VELOCITA'| 'ACCESSO AREA NON AUTORIZZATA';
    declare created_at: Date;


  static inizializzaModel(sequelize: Sequelize): typeof Violazione {
    return Violazione.init({
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
        tipo: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
        }
        }, {
        sequelize,
        tableName: 'violazioni',
        freezeTableName: true,
        timestamps: false
        });
  }
}