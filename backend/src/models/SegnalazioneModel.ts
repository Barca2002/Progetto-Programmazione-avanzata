import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

export interface SegnalazioneAllData {
    id: number;
    mmsi: number;
    geoarea_id: number;
    stato: 'IN CORSO' | 'RIENTRATA';
    created_at: Date;
}

export interface SegnalazioneCreationData extends Omit<Optional<SegnalazioneAllData, 'mmsi'>,'created_at'> {}


export class Segnalazione extends Model<SegnalazioneAllData, SegnalazioneCreationData> implements SegnalazioneAllData {
    declare id: number;
    declare mmsi: number;
    declare geoarea_id: number;
    declare stato: 'IN CORSO' | 'RIENTRATA';
    declare created_at: Date;


  static inizializzaModel(sequelize: Sequelize): typeof Segnalazione {
    return Segnalazione.init({
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
        stato: {
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
        tableName: 'segnalazioni',
        freezeTableName: true,
        timestamps: false
        });
    }
}