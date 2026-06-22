import { Imbarcazione } from './ImbarcazioneModel.js';
import { Geofencearea } from './GeofenceareaModel.js';
import { User } from './UserModel.js';
import { GeofenceImbarcazioni } from './GeofenceImbarcazioniModel.js'; // modello della tabella di giunzione

// Si inizializzano le associazioni molti a molti (tabelle di collegamento)
// HasMany = 1:N, BelongsToMany = N:N
export function inizializzaAssociazioni(): void {
    // Tra imbarcazione e Geofenceareas c'è una molti a molti
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