import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { SegnalazioneDAO } from '../dao/SegnalazioneDAO.js';
import { SegnalazioneCreationData } from '../models/SegnalazioneModel.js';
import { GeofenceareaService } from './GeofenceareaService.js';

export class SegnalazioneService{

    private segnalazioneDao = new SegnalazioneDAO();
    private geofenceareaService = new GeofenceareaService();

    async createSegnalazione(data: SegnalazioneCreationData){
        const t = await DatabaseConnection.getInstance().transaction();
        try {
            const geoarea = await this.geofenceareaService.getAreaById(data.geoarea_id);
            if (!geoarea) {
                throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
            }
            const result = await this.segnalazioneDao.create(data, t);
            await t.commit();
            return result;
        } catch (err) {
            await t.rollback();
            if (err instanceof AppError) { 
                throw err;
            }
            throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
        }
    }

    async getSegnalazioniByGeoarea(geoarea_id: number){
        if(!geoarea_id || isNaN(geoarea_id) || geoarea_id <= 0){
            throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID);
        }
        const segnalazioni = this.segnalazioneDao.findAllByGeoarea(geoarea_id);
        if(!segnalazioni){
            throw ErrorFactory.getError(AppErrorEnum.SEGNALAZIONE_NOT_FOUND);
        }
        return segnalazioni;
    }
}