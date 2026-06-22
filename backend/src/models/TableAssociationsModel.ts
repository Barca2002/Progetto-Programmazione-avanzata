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

    // Relazione 1:N. Un utente ha più imbarcazioni, ma un'imbarcazione è posseduta da un solo utente.
    User.hasMany(Imbarcazione, {
        foreignKey: 'user_id',
        as: 'Imbarcazioni'
    });

    Imbarcazione.belongsToMany(User, {
        through: 'user_imbarcazioni',
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'user_id',
        as: 'Proprietario'
    });
}