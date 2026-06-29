import { Imbarcazione } from '../models/ImbarcazioneModel.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';
import { LogSpostamenti } from '../models/LogSpostamentiModel.js';
import { Segnalazione } from '../models/SegnalazioneModel.js';
import { Violazione } from '../models/ViolazioneModel.js';
import { Datiinviati } from '../models/DatiInviatiModel.js';
import { GeofenceAreaController } from '../controllers/GeofenceareaController.js';


export function inizializzaAssociazioni(): void {

    // GEOAREA CON IMBARCAZIONE (N:N)
    Imbarcazione.belongsToMany(Geofencearea, {
        through: 'geofence_imbarcazioni',
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'geoarea_id',
        as: 'Geofenceareas'
    });


    Geofencearea.belongsToMany(Imbarcazione, {
        through: 'geofence_imbarcazioni',
        timestamps: false,
        foreignKey: 'geoarea_id',
        otherKey: 'mmsi',
        as: 'Imbarcazioni'
    });

    // IMBARCAZIONE CON USER (1:N)
    User.hasMany(Imbarcazione, {
        foreignKey: 'user_id',
        as: 'Imbarcazioni'
    });

    Imbarcazione.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'Proprietario'
    });

    // IMBARCAZIONE E GEOAREA CON LOG_SPOSTAMENTI (1:N)
    Imbarcazione.hasMany(LogSpostamenti, {
        foreignKey: 'mmsi',
        as: 'Spostamenti'
    });

    LogSpostamenti.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'Imbarcazione'
    });

    Geofencearea.hasMany(LogSpostamenti, {
        foreignKey: 'geoarea_id',
        as: 'Spostamenti'
    });

    LogSpostamenti.belongsTo(Geofencearea, {
        foreignKey: 'geoarea_id',
        as: 'Geofencearea'
    });

    // IMBARCAZIONE CON SEGNALAZIONE (N:N)
    Imbarcazione.belongsToMany(Segnalazione, {
        through: 'imbarcazioni_segnalazioni',
        timestamps: false,
        foreignKey: 'mmsi',
        otherKey: 'id_segnalazione',
        as: 'Segnalazioni'
    });


    Segnalazione.belongsToMany(Imbarcazione, {
        through: 'imbarcazioni_segnalazioni',
        timestamps: false,
        foreignKey: 'id_segnalazione',
        otherKey: 'mmsi',
        as: 'Imbarcazioni'
    });

    // IMBARCAZIONE E GEOAREA CON VIOLAZIONE (1:N)
    Imbarcazione.hasMany(Violazione, {
        foreignKey: 'mmsi',
        as: 'Violazioni'
    });

    Violazione.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'Imbarcazione'
    });

    Geofencearea.hasMany(Violazione, {
        foreignKey: 'geoarea_id',
        as: 'Violazioni'
    });

    Violazione.belongsTo(Geofencearea, {
        foreignKey: 'geoarea_id',
        as: 'Geofencearea'
    });

    // IMBARCAZIONE CON DATI INVIATI (1:N)
    Imbarcazione.hasMany(Datiinviati, {
        foreignKey: 'mmsi',
        as: 'ImbarcazioneDati'
    });

    Datiinviati.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'DatoInviatoImbarcazione'
    });
}