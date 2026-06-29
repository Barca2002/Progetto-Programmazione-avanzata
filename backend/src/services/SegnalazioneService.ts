import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { SegnalazioneDAO } from '../dao/SegnalazioneDAO.js';
import { SegnalazioneCreationData } from '../models/SegnalazioneModel.js';
import { GeofenceareaService } from './GeofenceareaService.js';
import { ViolazioneDAO } from '../dao/ViolazioneDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';

export class SegnalazioneService{
    private readonly segnalazioneDao = new SegnalazioneDAO();
    private readonly geofenceareaService = new GeofenceareaService();
    private readonly violazioneDAO = new ViolazioneDAO();

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
        if(!geoarea_id || Number.isNaN(geoarea_id) || geoarea_id <= 0){
            throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID);
        }
        const segnalazioni = await this.segnalazioneDao.findAllByGeoarea(geoarea_id);
        if(!segnalazioni){
            throw ErrorFactory.getError(AppErrorEnum.SEGNALAZIONE_NOT_FOUND);
        }
        return segnalazioni;
    }

    // Funzione per controllare se generare o no una segnalazione per una geoarea.
    async checkIfSegnalazione(data: DatiinviatiCreationData){
        const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.mmsi, data.longitudine, data.latitudine);
        if(!current_geoarea){
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        }

        const recentViolazioni = await this.violazioneDAO.findByGeoareaLimit7(current_geoarea.geoarea_id);
        // Se non ci sono violazioni o sono < di 5 non bisogna generare una segnalazione
        if(!recentViolazioni || recentViolazioni?.length <= 5){
            return;
        }
        const ultimaViolazione = recentViolazioni[0]!;
        const penultimaViolazione = recentViolazioni[1]!;
        
        // Se l'ultima violazione è avvenuta al massimo 1 ora dopo la penultima, non deve essere contata.
        const includiUltimaViolazione = (ultimaViolazione.created_at.getTime() - penultimaViolazione.created_at.getTime()) > 60 * 60 * 1000;

        // Per definire la finestra temporale bisogna decidere qual'è la violazione di partenza (ultima o penultima).
        const violazioneDiPartenza = includiUltimaViolazione ? ultimaViolazione : penultimaViolazione;

        // Definizione della data iniziale in cui far partire la finestra temporale in base alla violazione di partenza (Linux epoch).
        const startTime = new Date(violazioneDiPartenza.created_at).getTime();

        // Definizione finestra di 2 giorni. Dallo startTime andiamo indietro di 2 giorni.
        const inizioFinestra = startTime;
        const fineFinestra = startTime - 2 * 24 * 60 * 60 * 1000;

        // Filtriamo le violazioni in base al vincolo temporale
        const violazioniValide = recentViolazioni.filter(v => {

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
            await this.checkRientroSegnalazione(current_geoarea.geoarea_id);
        }
    }
    async checkRientroSegnalazione(geoarea_id: number){
        const lastSegnalazioneInCorso = await this.segnalazioneDao.findLastInCorsoByGeoarea(geoarea_id);
            
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