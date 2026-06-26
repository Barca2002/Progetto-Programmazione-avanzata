import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { SegnalazioneDAO } from '../dao/SegnalazioneDAO.js';
import { SegnalazioneCreationData } from '../models/SegnalazioneModel.js';
import { GeofenceareaService } from './GeofenceareaService.js';
import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ViolazioneDAO } from '../dao/ViolazioneDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';

export class SegnalazioneService{

    private segnalazioneDao = new SegnalazioneDAO();
    private geofenceareaService = new GeofenceareaService();
    private datiinviatiDAO = new DatiinviatiDAO();
    private violazioneDAO = new ViolazioneDAO();

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

    // Funzione per controllare se generare o no una segnalazione per una geoarea.
    async checkIfSegnalazione(data: DatiinviatiCreationData){
        const current_geoarea = await this.datiinviatiDAO.getGeoareaByPosition(data.mmsi, data.longitudine, data.latitudine);
        if(!current_geoarea){
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        }

        const allViolazioni = await this.violazioneDAO.findAllByGeoarea(current_geoarea.geoarea_id);

        // Se non ci sono violazioni o sono < di 5 non bisogna generare una segnalazione
        if(!allViolazioni || allViolazioni?.length <= 5){
            return;
        }
        const ultimaViolazione = allViolazioni[0]!;
        const penultimaViolazione = allViolazioni[1]!;
        
        // Se l'ultima violazione è avvenuta al massimo 1 ora dopo la penultima, non deve essere contata.
        const includiUltimaViolazione = (ultimaViolazione.created_at.getTime() - penultimaViolazione.created_at.getTime()) > 60 * 60 * 1000;

        // Per definire la finestra temporale bisogna decidere qual'è la violazione di partenza (ultima o penultima).
        const violazioneDiPartenza = includiUltimaViolazione ? penultimaViolazione : ultimaViolazione;

        // Definizione della data iniziale in cui far partire la finestra temporale in base alla violazione di partenza (Linux epoch).
        const startTime = new Date(violazioneDiPartenza.created_at).getTime();

        // Definizione finestra di 2 giorni. Dallo startTime andiamo indietro di 2 giorni.
        const inizioFinestra = startTime;
        const fineFinestra = startTime - 2 * 24 * 60 * 60 * 1000;

        // Filtriamo le violazioni in base al vincolo temporale
        const violazioniValide = allViolazioni.filter(v => {

            const t = new Date(v.created_at).getTime();
            return (t <= inizioFinestra && t >= fineFinestra);
        });

        // Se ci sono più di 5 violazioni, emettiamo una segnalazione per quella geoarea.
        if (violazioniValide.length > 5) {
            // Se già c'è una segnalazione in corso, non serve ricrearla
            if (await this.segnalazioneDao.findLastInCorsoByGeoarea(current_geoarea.geoarea_id)){
                return;
            }
            // Se non c'è una segnalazione in corso, la creiamo.
            const t = await DatabaseConnection.getInstance().transaction();
            try {
                const newSegnalazione: SegnalazioneCreationData = {geoarea_id: current_geoarea.geoarea_id, stato: "IN CORSO"};
                await this.createSegnalazione(newSegnalazione);
                await t.commit();
            } catch (err) {
                await t.rollback();
                if (err instanceof AppError) { 
                    throw err;
                }
                throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
            } 
        } else {
            const lastSegnalazioneInCorso = await this.segnalazioneDao.findLastInCorsoByGeoarea(current_geoarea.geoarea_id);
            
            if (!lastSegnalazioneInCorso){
                // Se non ci sono segnalazioni in corso, non si può impostare lo stato in "RIENTRATA".
                return;
            }
            // Se c'è almeno una violazione (meno di 6), setta lo stato della segnalazione associata a quella geoarea a RIENTRATA.
            const t = await DatabaseConnection.getInstance().transaction();
            try {
                const data: Partial<SegnalazioneCreationData> = {stato: "RIENTRATA"}
                await this.segnalazioneDao.update(lastSegnalazioneInCorso.id, data, t);
                await t.commit();
            } catch (err) {
                await t.rollback();
                if (err instanceof AppError) { 
                    throw err;
                }
                throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
            }
        }
    }
}