// models/associations.ts
import { Imbarcazione } from './ImbarcazioneModel.js';
import { Geofencearea } from './GeofenceareaModel.js';
import { User } from './UserModel.js';

export function inizializzaAssociazioni(): void {
    Imbarcazione.belongsToMany(Geofencearea, {
        through: 'geofence_imbarcazioni',
        foreignKey: 'mmsi',
        otherKey: 'geoarea_id',
    });

    Geofencearea.belongsToMany(Imbarcazione, {
        through: 'geofence_imbarcazioni',
        foreignKey: 'geoarea_id',
        otherKey: 'mmsi',
    });

    User.belongsToMany(Imbarcazione, {
        through: 'user_imbarcazioni',
        foreignKey: 'user_id',
        otherKey: 'mmsi',
    });

    Imbarcazione.belongsToMany(User, {
        through: 'user_imbarcazioni',
        foreignKey: 'mmsi',
        otherKey: 'user_id',
    });
}