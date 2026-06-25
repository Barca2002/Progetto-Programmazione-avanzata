import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { GeofenceareaService } from './GeofenceareaService.js';
import { ViolazioneDAO } from '../dao/ViolazioneDAO.js';
import { ImbarcazioneService } from './ImbarcazioneService.js';
import { ViolazioneCreationData } from '../models/ViolazioneModel.js';

export class ViolazioneService{

    private violazioneDAO = new ViolazioneDAO();
    private geofenceareaService = new GeofenceareaService();
    private imbarcazioneService = new ImbarcazioneService();

    async createViolazione(data: ViolazioneCreationData){
        const t = await DatabaseConnection.getInstance().transaction();
        try {
            const geoarea = await this.geofenceareaService.getAreaById(data.geoarea_id);
            const imbarcazione = await this.imbarcazioneService.getImbarcazioneByMmsi(data.mmsi);
            if (!geoarea) {
                throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
            }
            if (!imbarcazione){
                throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
            }
            if(!((data.tipo === 'ECCESSO VELOCITA') || (data.tipo === 'ACCESSO AREA NON AUTORIZZATA'))){
                throw ErrorFactory.getError(AppErrorEnum.INVALID_STATO_VIOLAZIONE);
            }
            const result = await this.violazioneDAO.create(data, t);
            await t.commit();
            return result;
        } catch (err) {
            console.log(err);
            await t.rollback();
            if (err instanceof AppError) { 
                throw err;
            }
            throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
        }
    }

    async getViolazioniByMmsi(mmsi: number){
        if(!mmsi || isNaN(mmsi) || mmsi <= 0){
            throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID);
        }
        // Controllo che esiste l'imbarcazione
        await this.imbarcazioneService.getImbarcazioneByMmsi(mmsi);
        const violazioni = this.violazioneDAO.findAllByMmsi(mmsi);
        if(!violazioni){
            throw ErrorFactory.getError(AppErrorEnum.VIOLAZIONE_NOT_FOUND);
        }
        return violazioni;
    }

    async getViolazioniByGeoarea(geoarea_id: number){
        if(!geoarea_id || isNaN(geoarea_id) || geoarea_id <= 0){
            throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID);
        }
        // Controllo che esista la geoarea
        await this.geofenceareaService.getAreaById(geoarea_id);
        const violazioni = this.violazioneDAO.findAllByGeoarea(geoarea_id);
        if(!violazioni){
            throw ErrorFactory.getError(AppErrorEnum.VIOLAZIONE_NOT_FOUND);
        }
        return violazioni;
    }
}