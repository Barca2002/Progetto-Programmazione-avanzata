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

    async createSegnalazione(data: SegnalazioneCreationData, violazioni: Violazione[]){
        const t = await DatabaseConnection.getInstance().transaction();
        try {
            const geoarea = await this.geofenceareaDAO.get(data.geoarea_id);
            // Siccome possiamo avere posizioni che non sono in una geoarea, possiamo non controllare se effettuare la segnalazione visto che le geoaree non vengono toccate.
            if (!geoarea) {
                throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
            }

            const newSegnalazione = await this.segnalazioneDao.create(data, t);
            // Vogliamo gli mmsi univoci, perché non possiamo inserire duplicati nella tabella imbarcazioni_segnalazioni.
            const imbarcazioniMmsi = new Set<number>();

            for (const violazione of violazioni) {
                const imbarcazione = await violazione.getImbarcazione();
                imbarcazioniMmsi.add(imbarcazione.mmsi);
            }
            // Sfruttiamo l'associazione con segnalazione e imbarcazione per aggiungere tutti le imbarcazioni tramite mmsi. ignoreDuplicates è sicurezza ridondante contro i duplicati.
            await newSegnalazione.addImbarcazioni([...imbarcazioniMmsi], {ignoreDuplicates: true, transaction: t});

            await t.commit();

        } catch (err) {
            await t.rollback();
            if (err instanceof AppError) { 
                throw err;
            }
            throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
        }
    }

    // Funzione per controllare se generare o no una segnalazione per una geoarea.
    async checkIfSegnalazione(data: DatiinviatiCreationData){
        const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
        
        if(!current_geoarea){
            // Possono esserci posizioni fuori dalle geoaree, quindi in tal caso non si controlla neanche se generare una segnalazione perché non si entra in nessuna geoarea.
            return;
        }
        // Prendo l'ultima violazione valida della geoarea corrente.
        let ultimaViolazioneValida = await this.violazioneDAO.getUltimaViolazioneValida(current_geoarea.geoarea_id);

        if(!ultimaViolazioneValida){
            // C'è il caso in cui non è stata mai commessa una violazione per una geoarea, quindi in tal caso si ritorna e basta, non si controlla per niente se geneare la segnalazione.
            return;
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
        let violazioniValide: Violazione[] = [];
        for (const v of violazioniRecenti){
            const t = new Date(v.created_at).getTime();
            if (t <= inizioFinestra && t >= fineFinestra){
                violazioniValide.push(v);
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
                await this.createSegnalazione(newSegnalazione, violazioniValide);
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
    // Funzione chiamata da checkIfSegnalazione per controllare se impostare lo stato della segnalazione a RIENTRATA.
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