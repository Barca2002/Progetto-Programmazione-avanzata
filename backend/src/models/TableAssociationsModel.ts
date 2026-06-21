import { Imbarcazione } from './ImbarcazioneModel.js';
import { Geofencearea } from './GeofenceareaModel.js';
import { User } from './UserModel.js';
import { GeofenceImbarcazioni } from './GeofenceImbarcazioni.js'; // modello della tabella di giunzione

export function inizializzaAssociazioni(): void {
    Imbarcazione.belongsToMany(Geofencearea, {
        through: GeofenceImbarcazioni,
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'geoarea_id',
        as: 'Geofenceareas'
    });

    Geofencearea.belongsToMany(Imbarcazione, {
        through: GeofenceImbarcazioni,
        timestamps: false,
        foreignKey: 'geoarea_id',
        otherKey: 'mmsi'
    });

    // le altre associazioni rimangono invariate...
    User.belongsToMany(Imbarcazione, {
        through: 'user_imbarcazioni',
        timestamps: false,
        foreignKey: 'user_id',
        otherKey: 'mmsi',
        as: 'Imbarcazioni'
    });

    Imbarcazione.belongsToMany(User, {
        through: 'user_imbarcazioni',
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'user_id',
        as: 'Users'
    });
}