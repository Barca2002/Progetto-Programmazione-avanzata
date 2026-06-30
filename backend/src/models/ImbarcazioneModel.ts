import { DataTypes, Sequelize, Model, Optional, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyAddAssociationMixin, BelongsToManyRemoveAssociationMixin } from 'sequelize';
import { Geofencearea } from './GeofenceareaModel.js';

export interface ImbarcazioneAllData {
  mmsi: number;
  name: string;
  type: string;
  descr: string;
  max_capacity: number;
  user_id: number;
  created_at: Date;
}

export interface ImbarcazioneCreationData extends Omit<Optional<ImbarcazioneAllData, 'mmsi'>, 'created_at'> {}


export class Imbarcazione extends Model<ImbarcazioneAllData, ImbarcazioneCreationData> implements ImbarcazioneAllData {
  declare mmsi: number;
  declare name: string;
  declare type: string;
  declare descr: string;
  declare max_capacity: number;
  declare user_id: number;
  declare created_at: Date;

  // Mixin generati dall'associazione belongsToMany con Geofencearea. Mixin è una tecnica per aggiungere metodi ad una classe senza usare l'ereditarietà.
  // Questi non aggiungono comportamento: dicono solo a TS che Sequelize popolerà questi metodi a runtime. Permettono di lavorare con le molti a molti/uno a molti.
  declare getGeofenceareas: BelongsToManyGetAssociationsMixin<Geofencearea>;
  declare hasGeofencearea: BelongsToManyHasAssociationMixin<Geofencearea, number>; // Ritorna se ha una singola area (booleano)
  declare hasGeofenceareas: BelongsToManyHasAssociationMixin<Geofencearea, number>;
  // Utili per aggiungere e rimuovere per linkare o unlinkare le geoaree.
  declare addGeofencearea: BelongsToManyAddAssociationMixin<Geofencearea, number>;
  declare removeGeofencearea: BelongsToManyRemoveAssociationMixin<Geofencearea, number>;

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