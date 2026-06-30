import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { SegnalazioneDAO } from '../dao/SegnalazioneDAO.js';
import { SegnalazioneCreationData } from '../models/SegnalazioneModel.js';
import { GeofenceareaService } from './GeofenceareaService.js';
import { ViolazioneDAO } from '../dao/ViolazioneDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { GeofenceareaDAO } from '../dao/GeofenceareaDAO.js';
import { Violazione } from '../models/ViolazioneModel.js';

export class SegnalazioneService{
    private readonly segnalazioneDao = new SegnalazioneDAO();
    private readonly geofenceareaService = new GeofenceareaService();
    private readonly violazioneDAO = new ViolazioneDAO();
    private readonly geofenceareaDAO = new GeofenceareaDAO();

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
        const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
        
        if(!current_geoarea){
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        }
        // Prendo l'ultima violazione valida della geoarea corrente.
        let ultimaViolazioneValida = await this.violazioneDAO.getUltimaViolazioneValida(current_geoarea.geoarea_id);

        if(!ultimaViolazioneValida){
            throw ErrorFactory.getError(AppErrorEnum.VIOLAZIONE_NOT_FOUND);
        }
        
        // Prendo le violazioni della geoarea che sono vecchie al massimo 2 giorni dall'ultima violazione valida perché le altre non servono. Potrebbe contenere nuove violazioni non valide (potrebbe avere n violazioni che sono arrivate prima di 1 ora dall'ultima violazioen valida).
        const violazioniRecenti = await this.violazioneDAO.getRecentByGeoarea(current_geoarea.geoarea_id);
        const ultimaViolazione = violazioniRecenti![0];

        if(!ultimaViolazione){
            throw ErrorFactory.getError(AppErrorEnum.VIOLAZIONE_NOT_FOUND);
        }

        // Se l'ultima violazione è avvenuta al massimo 1 ora dopo l'ultima violazione valida, non deve essere contata. Di conseguenza anche tutte le violazioni avvenute prima di essa.
        const ultimaViolazioneIsValid = (ultimaViolazione!.created_at.getTime() - ultimaViolazioneValida.created_at.getTime()) > 60 * 60 * 1000;

        // Se l'ultima violazione è valida, allora aggiorniamo quella nella geofence area.
        if(ultimaViolazioneIsValid){
            const t = await DatabaseConnection.getInstance().transaction();
            await this.geofenceareaDAO.update(current_geoarea.geoarea_id, {ultima_violazione_valida_id: ultimaViolazione.id}, t);
            await t.commit();
            ultimaViolazioneValida = ultimaViolazione;
        }

        // Se non ci sono violazioni recenti (cioè entro 2 giorni) o sono < di 5 non bisogna generare una segnalazione.
        if(!violazioniRecenti || violazioniRecenti?.length <= 5){
            return;
        }

        // --- CONTROLLO VALIDITA' VIOLAZIONI RECENTI ----
        // Per definire la finestra temporale bisogna decidere qual'è la violazione di partenza (l'ultima trovata o l'ultima valida salvata).
        // Definizione finestra di 2 giorni. Dal inizioFinestra andiamo indietro di 2 giorni.
        const inizioFinestra = new Date(ultimaViolazioneValida.created_at).getTime();
        const fineFinestra = inizioFinestra - 2 * 24 * 60 * 60 * 1000;

        // Filtriamo le violazioni in base al vincolo temporale.
        // Ottimizzazione: se troviamo più di 5 elementi che soddisfano il vincolo, ci fermiamo perché già bastano per creare la segnalazione.
        let violazioniValide: Violazione[] = [];
        for (const v of violazioniRecenti){
            const t = new Date(v.created_at).getTime();
            if (t <= inizioFinestra && t >= fineFinestra){
                violazioniValide.push(v);
            }
            if(violazioniValide.length > 5){
                break;
            }
        }

        // Se ci sono più di 5 violazioni, emettiamo una segnalazione per quella geoarea (se già non c'è).
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
            // Se c'è almeno una violazione (ovviamente meno di 6), setta lo stato della segnalazione associata a quella geoarea a RIENTRATA.
            const t = await DatabaseConnection.getInstance().transaction();
            try {
                await this.segnalazioneDao.update(lastSegnalazioneInCorso.id, {stato: "RIENTRATA"}, t);
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