import { Model, DataTypes, Sequelize } from 'sequelize';

export class UserImbarcazioni extends Model {
  declare user_id: number;
  declare mmsi: number;

  public static inizializzaModel(sequelize: Sequelize) {
    UserImbarcazioni.init(
      {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'users', // nome della tabella degli utenti
            key: 'id',
          },
        },
        mmsi: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'imbarcazioni', // nome della tabella delle imbarcazioni
            key: 'mmsi',
          },
        },
      },
      {
        sequelize,
        modelName: 'UserImbarcazione',
        tableName: 'user_imbarcazioni',
        timestamps: false,
      }
    );
  }
}