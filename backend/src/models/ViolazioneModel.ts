import { DataTypes, Sequelize, Model } from 'sequelize';

export interface ViolazioneAllData {
    id: number;
    mmsi: number;
    geoarea_id: number;
    tipo: string;
    conta_in_segnalazione: boolean;
    created_at: Date;
}

export interface ViolazioneCreationData extends Omit<ViolazioneAllData, 'id' |'created_at'> {}


export class Violazione extends Model<ViolazioneAllData, ViolazioneCreationData> implements ViolazioneAllData {
    declare id: number;
    declare mmsi: number;
    declare geoarea_id: number;
    declare tipo: string;
    declare conta_in_segnalazione: boolean;
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
            type: DataTypes.ENUM('ECCESSO VELOCITA', 'ACCESSO AREA NON AUTORIZZATA'),
            allowNull: false
        },
        conta_in_segnalazione: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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