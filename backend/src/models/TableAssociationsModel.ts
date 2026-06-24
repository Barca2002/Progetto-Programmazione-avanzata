import { Imbarcazione } from './ImbarcazioneModel.js';
import { Geofencearea } from './GeofenceareaModel.js';
import { User } from './UserModel.js';
import { GeofenceImbarcazioni } from './GeofenceImbarcazioniModel.js';
import { LogSpostamenti } from './LogSpostamentiModel.js';

export function inizializzaAssociazioni(): void {

    // N:N — Una Imbarcazione può appartenere a molte Geofencearea e una Geofencearea può contenere molte Imbarcazioni (tramite tabella ponte geofence_imbarcazioni)
    Imbarcazione.belongsToMany(Geofencearea, {
        through: GeofenceImbarcazioni,
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'geoarea_id',
        as: 'Geofenceareas'
    });

    // N:N — Una Geofencearea può contenere molte Imbarcazioni e una Imbarcazione può appartenere a molte Geofencearea (tramite tabella ponte geofence_imbarcazioni)
    Geofencearea.belongsToMany(Imbarcazione, {
        through: GeofenceImbarcazioni,
        timestamps: false,
        foreignKey: 'geoarea_id',
        otherKey: 'mmsi',
        as: 'Imbarcazioni'
    });

    // 1:N — Un User può possedere molte Imbarcazioni direttamente tramite la FK user_id presente in imbarcazioni
    User.hasMany(Imbarcazione, {
        foreignKey: 'user_id',
        as: 'Imbarcazioni'
    });

    // N:1 — Una Imbarcazione appartiene a un solo User tramite la FK user_id (relazione inversa)
    Imbarcazione.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'Proprietario'
    });

    // 1:N — Una Imbarcazione può avere molti LogSpostamenti e la foreign key mmsi si trova nella tabella log_spostamenti
    Imbarcazione.hasMany(LogSpostamenti, {
        foreignKey: 'mmsi',
        as: 'LogSpostamenti'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Imbarcazione tramite la foreign key mmsi
    LogSpostamenti.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'Imbarcazione'
    });

    // 1:N — Una Geofencearea può avere molti LogSpostamenti e la foreign key geoarea_id si trova nella tabella log_spostamenti
    Geofencearea.hasMany(LogSpostamenti, {
        foreignKey: 'geoarea_id',
        as: 'LogSpostamenti'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Geofencearea tramite la foreign key geoarea_id
    LogSpostamenti.belongsTo(Geofencearea, {
        foreignKey: 'geoarea_id',
        as: 'Geofencearea'
    });
}