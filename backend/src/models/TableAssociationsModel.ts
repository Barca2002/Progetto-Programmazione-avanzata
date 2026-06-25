import { Imbarcazione } from './ImbarcazioneModel.js';
import { Geofencearea } from './GeofenceareaModel.js';
import { User } from './UserModel.js';
import { GeofenceImbarcazioni } from './GeofenceImbarcazioniModel.js';
import { LogSpostamenti } from './LogSpostamentiModel.js';
import { Segnalazione } from './SegnalazioneModel.js';
import { Violazione } from './ViolazioneModel.js';

export function inizializzaAssociazioni(): void {

    // GEOAREA CON IMBARCAZIONE (N:N)
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

    // IMBARCAZIONE CON USER (1:N)
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

    // IMBARCAZIONE E GEOAREA CON LOGSPOSTAMENTI (1:N)
    // 1:N — Una Imbarcazione può avere molti LogSpostamenti e la foreign key mmsi si trova nella tabella log_spostamenti
    Imbarcazione.hasMany(LogSpostamenti, {
        foreignKey: 'mmsi',
        as: 'Spostamenti'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Imbarcazione tramite la foreign key mmsi
    LogSpostamenti.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'Imbarcazione'
    });

    // 1:N — Una Geofencearea può avere molti LogSpostamenti tramite la foreign key geoarea_id
    Geofencearea.hasMany(LogSpostamenti, {
        foreignKey: 'geoarea_id',
        as: 'Spostamenti'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Geofencearea tramite la foreign key geoarea_id
    LogSpostamenti.belongsTo(Geofencearea, {
        foreignKey: 'geoarea_id',
        as: 'Geofencearea'
    });

    // IMBARCAZIONE E GEOAREA CON SEGNALAZIONE (1:N)
    Imbarcazione.hasMany(Segnalazione, {
    foreignKey: 'mmsi',
    as: 'Imbarcazioni'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Imbarcazione tramite la foreign key mmsi
    Segnalazione.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'Segnalazione'
    });

    // 1:N — Una Geofencearea può avere molti LogSpostamenti tramite la foreign key geoarea_id
    Geofencearea.hasMany(Segnalazione, {
        foreignKey: 'geoarea_id',
        as: 'Geofenceareas'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Geofencearea tramite la foreign key geoarea_id
    Segnalazione.belongsTo(Geofencearea, {
        foreignKey: 'geoarea_id',
        as: 'Segnalazione'
    });






    // IMBARCAZIONE E GEOAREA CON VIOLAZIONE (1:N)
    Imbarcazione.hasMany(Violazione, {
    foreignKey: 'mmsi',
    as: 'Imbarcazioni'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Imbarcazione tramite la foreign key mmsi
    Violazione.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'Violazione'
    });

    // 1:N — Una Geofencearea può avere molti LogSpostamenti tramite la foreign key geoarea_id
    Geofencearea.hasMany(Violazione, {
        foreignKey: 'geoarea_id',
        as: 'Geofenceareas'
    });

    // N:1 — Un LogSpostamenti appartiene a una sola Geofencearea tramite la foreign key geoarea_id
    Violazione.belongsTo(Geofencearea, {
        foreignKey: 'geoarea_id',
        as: 'Violazione'
    });
}