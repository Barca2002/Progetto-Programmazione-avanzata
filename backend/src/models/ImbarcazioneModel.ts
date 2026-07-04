import { DataTypes, Sequelize, Model, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyAddAssociationMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyHasAssociationsMixin } from 'sequelize';
import { Geofencearea } from './GeofenceareaModel.js';
import { Segnalazione } from './SegnalazioneModel.js';

export interface ImbarcazioneAllData {
  mmsi: number;
  name: string;
  type: string;
  descr: string;
  max_capacity: number;
  user_id: number;
  created_at: Date;
}

export interface ImbarcazioneCreationData extends Omit<ImbarcazioneAllData, 'created_at'> { }

export interface LinkDataBody {
  mmsi: number;
  geoarea_ids: number[];
}

export interface UnlinkDataBody {
  mmsi: number;
  geoarea_id: number;
}

export interface GetPointsAsGeoJsonBody {
  mmsi: number;
  start_date: string;
  end_date?: string;
}

export class Imbarcazione extends Model<ImbarcazioneAllData, ImbarcazioneCreationData> implements ImbarcazioneAllData {
  declare mmsi: number;
  declare name: string;
  declare type: string;
  declare descr: string;
  declare max_capacity: number;
  declare user_id: number;
  declare created_at: Date;

  /**
   *  Metodi Mixin generati dall'associazione belongsToMany con Geofencearea. Mixin è una tecnica per aggiungere (mescolare) metodi ad una classe senza usare l'ereditarietà.
   * Questi metodi non aggiungono comportamento, ma dicono solo a TS che Sequelize popolerà questi metodi a runtime. Permettono di lavorare con le molti a molti/uno a molti.
   *  */
  declare getGeofenceareas: BelongsToManyGetAssociationsMixin<Geofencearea>;
  declare hasGeofencearea: BelongsToManyHasAssociationMixin<Geofencearea, number>;
  declare hasGeofenceareas: BelongsToManyHasAssociationsMixin<Geofencearea, number>;

  declare addGeofencearea: BelongsToManyAddAssociationMixin<Geofencearea, number>;
  declare removeGeofencearea: BelongsToManyRemoveAssociationMixin<Geofencearea, number>;

  declare getSegnalazioni: BelongsToManyGetAssociationsMixin<Segnalazione>;
  declare hasSegnalazione: BelongsToManyHasAssociationMixin<Segnalazione, number>;
  declare hasSegnalazioni: BelongsToManyHasAssociationsMixin<Segnalazione, number>;
  declare addSegnalazione: BelongsToManyAddAssociationMixin<Segnalazione, number>;
  declare removeSegnalazione: BelongsToManyRemoveAssociationMixin<Segnalazione, number>;

  static inizializzaModel(sequelize: Sequelize): typeof Imbarcazione {
    return Imbarcazione.init({
      mmsi: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'imbarcazioni_name_key'
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      descr: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      max_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      tableName: 'imbarcazioni',
      freezeTableName: true,
      timestamps: false
    });
  }
}