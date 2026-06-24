import { Imbarcazione } from './ImbarcazioneModel.js';
import { Geofencearea } from './GeofenceareaModel.js';
import { User } from './UserModel.js';
import { GeofenceImbarcazioni } from './GeofenceImbarcazioniModel.js';
import { LogSpostamenti } from './LogSpostamentiModel.js';

export function inizializzaAssociazioni(): void {

    // N:N — Imbarcazione <-> Geofencearea
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
        otherKey: 'mmsi',
        as: 'Imbarcazioni'
    });

    // 1:N — Un User ha molte Imbarcazioni e una Imbarcazione appartiene a un solo User
    User.hasMany(Imbarcazione, {
        foreignKey: 'user_id',
        as: 'Imbarcazioni'
    });

    Imbarcazione.belongsTo(User, {      
        foreignKey: 'user_id',
        as: 'Proprietario'
    });

    // 1:N — Una Imbarcazione ha molti LogMovimenti
    Imbarcazione.hasMany(LogSpostamenti, {
        foreignKey: 'mmsi',
        as: 'LogMovimenti'
    });

    LogSpostamenti.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'Imbarcazione'
    });

    // 1:N — Una Geofencearea ha molti LogMovimenti
    Geofencearea.hasMany(LogSpostamenti, {
        foreignKey: 'geoarea_id',
        as: 'LogMovimenti'
    });

    LogSpostamenti.belongsTo(Geofencearea, {
        foreignKey: 'geoarea_id',
        as: 'Geofencearea'
    });
}