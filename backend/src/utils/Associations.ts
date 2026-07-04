import { Imbarcazione } from '../models/ImbarcazioneModel.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';
import { LogSpostamenti } from '../models/LogSpostamentiModel.js';
import { Segnalazione } from '../models/SegnalazioneModel.js';
import { Violazione } from '../models/ViolazioneModel.js';
import { Datiinviati } from '../models/DatiInviatiModel.js';

export function inizializzaAssociazioni(): void {

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

    User.hasMany(Imbarcazione, {
        foreignKey: 'user_id',
        as: 'Imbarcazioni'
    });

    Imbarcazione.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'Proprietario'
    });

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

    Imbarcazione.hasMany(Datiinviati, {
        foreignKey: 'mmsi',
        as: 'ImbarcazioneDati'
    });

    Datiinviati.belongsTo(Imbarcazione, {
        foreignKey: 'mmsi',
        as: 'DatoInviatoImbarcazione'
    });
}