import { DataTypes, Sequelize, Model, BelongsToManyAddAssociationMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyAddAssociationsMixin } from 'sequelize';
import { Imbarcazione } from './ImbarcazioneModel.js';

export interface SegnalazioneAllData {
    id: number;
    geoarea_id: number;
    stato: string;
    created_at: Date;
}

export interface SegnalazioneCreationData extends Omit<SegnalazioneAllData, 'id' | 'created_at'> { }


export class Segnalazione extends Model<SegnalazioneAllData, SegnalazioneCreationData> implements SegnalazioneAllData {
    declare id: number;
    declare geoarea_id: number;
    declare stato: string;
    declare created_at: Date;

    declare addImbarcazione: BelongsToManyAddAssociationMixin<Imbarcazione, number>;
    declare addImbarcazioni: BelongsToManyAddAssociationsMixin<Imbarcazione, number>;
    declare removeImbarcazione: BelongsToManyRemoveAssociationMixin<Imbarcazione, number>;


    static inizializzaModel(sequelize: Sequelize): typeof Segnalazione {
        return Segnalazione.init({
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            geoarea_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            stato: {
                type: DataTypes.ENUM('IN CORSO', 'RIENTRATA'),
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