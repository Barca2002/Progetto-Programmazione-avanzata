import { Imbarcazione } from './ImbarcazioneModel.js';
import { Geofencearea } from './GeofenceareaModel.js';
import { User } from './UserModel.js';

export function inizializzaAssociazioni(): void {
    Imbarcazione.belongsToMany(Geofencearea, {
        through: 'geofence_imbarcazioni',
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'geoarea_id',
        as: 'Geofenceareas' //messo perchè altrimenti dava problemi quando si fanno query inter-relazionali fra tabelle diverse
    });

    Geofencearea.belongsToMany(Imbarcazione, {
        through: 'geofence_imbarcazioni',
        timestamps: false,
        foreignKey: 'geoarea_id',
        otherKey: 'mmsi'
    });

    User.belongsToMany(Imbarcazione, {
        through: 'user_imbarcazioni',
        timestamps: false,
        foreignKey: 'user_id',
        otherKey: 'mmsi',
    });

    Imbarcazione.belongsToMany(User, {
        through: 'user_imbarcazioni',
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'user_id',
    });
}