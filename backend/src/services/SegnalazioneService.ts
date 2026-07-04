import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { SegnalazioneDAO } from '../dao/SegnalazioneDAO.js';
import { Segnalazione, SegnalazioneCreationData } from '../models/SegnalazioneModel.js';
import { GeofenceareaService } from './GeofenceareaService.js';
import { ViolazioneDAO } from '../dao/ViolazioneDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { GeofenceareaDAO } from '../dao/GeofenceareaDAO.js';
import { Violazione } from '../models/ViolazioneModel.js';

export class SegnalazioneService {
    private readonly segnalazioneDao = new SegnalazioneDAO();
    private readonly geofenceareaService = new GeofenceareaService();
    private readonly violazioneDAO = new ViolazioneDAO();
    private readonly geofenceareaDAO = new GeofenceareaDAO();

    /**
     * Funzione che aggiunge imbarcazioni ad una segnalazione tramite un insieme di violazioni. I duplicati vengono scartati.
     * @param segnalazione oggetto Segnalazione.
     * @param violazioni lista di oggetti Violazione.
     */
    public async addImbarcazioniToSegnalazione(segnalazione: Segnalazione, violazioni: Violazione[]) {
        if (!await this.segnalazioneDao.get(segnalazione.id)) {
            throw ErrorFactory.getError(AppErrorEnum.SEGNALAZIONE_NOT_FOUND)
        }
        const t = await DatabaseConnection.getInstance().transaction();
        const imbarcazioniMmsi = new Set<number>();
        try {
            for (const violazione of violazioni) {
                imbarcazioniMmsi.add(violazione.mmsi);
            }
            await segnalazione.addImbarcazioni([...imbarcazioniMmsi], { ignoreDuplicates: true, transaction: t });
            await t.commit();
        } catch (error) {
            await t.rollback()
            throw ErrorFactory.getError(AppErrorEnum.ADD_IMBARCAZIONI_TO_SEGNALAZIONE_ERROR);
        }
    }

    /**
     * Funzione che crea una segnalazione in base ai dati passati. Controlla se la geofence area associata esiste.
     * @param data oggetto che implementa l'interfaccia ViolazioneCreationData, quindi che contiene tutti i dati necessari per creare una violazione.
     * @param violazioni lista di violazioni.
     */
    public async createSegnalazione(data: SegnalazioneCreationData, violazioni: Violazione[]) {
        const t = await DatabaseConnection.getInstance().transaction();
        try {
            const geoarea = await this.geofenceareaDAO.get(data.geoarea_id);
            if (!geoarea) {
                throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
            }
            const newSegnalazione = await this.segnalazioneDao.create(data, t);
            await t.commit();

            await this.addImbarcazioniToSegnalazione(newSegnalazione, violazioni);
            await t.commit();
        } catch (err) {
            await t.rollback();
            if (err instanceof AppError) {
                throw err;
            }
            throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
        }
    }

    /**
     * Funzione che controlla se generare una segnalazione in base ai dati inviati dall'utente e alle violazioni precedenti di una geofence area. Inoltre si controlla se le violazioni precedenti ed attuali sono valide. Cioè ci devono essere almeno 6 violazioni valide in una finestra temporale di 2 giorni dall'ultima valida. Le violazioni che arrivano dopo l'ultima valida devono discostare di più di 1 ora per diventare valide.
     * Il numero d'imbarcazioni che fanno parte della segnalazione può aumentare man mano che arrivano altri dati.
     * Se il numero di violazioni valide diventa 5 o meno, la segnalazione va in stato ritirata.
     * Se l'imbarcazione è fuori da una geofence area, non si genera una segnalazione.
     * @param data oggetto che implementa l'interfaccia ViolazioneCreationData, quindi che contiene tutti i dati necessari per creare una violazione.
     * @returns void.
     */
    public async checkIfSegnalazione(data: DatiinviatiCreationData) {
        const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
        if (!current_geoarea) {
            return;
        }

        let ultimaViolazioneValida = await this.violazioneDAO.getUltimaViolazioneValida(current_geoarea.geoarea_id);

        if (!ultimaViolazioneValida) {
            return;
        }

        const violazioniRecenti = await this.violazioneDAO.getRecentByGeoarea(current_geoarea.geoarea_id);
        const ultimaViolazione = violazioniRecenti![0];

        if (!ultimaViolazione) {
            throw ErrorFactory.getError(AppErrorEnum.VIOLAZIONE_NOT_FOUND);
        }

        const ultimaViolazioneIsValid = (ultimaViolazione!.created_at.getTime() - ultimaViolazioneValida.created_at.getTime()) > 60 * 60 * 1000;

        if (ultimaViolazioneIsValid) {
            const t = await DatabaseConnection.getInstance().transaction();
            await this.geofenceareaDAO.update(current_geoarea.geoarea_id, { ultima_violazione_valida_id: ultimaViolazione.id }, t);
            await t.commit();
            ultimaViolazioneValida = ultimaViolazione;
        }

        if (!violazioniRecenti || violazioniRecenti?.length <= 5) {
            await this.checkRientroSegnalazione(current_geoarea.geoarea_id);
            return;
        }

        const inizioFinestra = new Date(ultimaViolazioneValida.created_at).getTime();
        const fineFinestra = inizioFinestra - 2 * 24 * 60 * 60 * 1000;

        let violazioniValide: Violazione[] = [];
        for (const v of violazioniRecenti) {
            const t = new Date(v.created_at).getTime();
            if (t <= inizioFinestra && t >= fineFinestra) {
                violazioniValide.push(v);
            }
        }

        if (violazioniValide.length > 5) {
            const lastSegnalazione = await this.segnalazioneDao.findLastInCorsoByGeoarea(current_geoarea.geoarea_id);
            if (lastSegnalazione) {
                await this.addImbarcazioniToSegnalazione(lastSegnalazione, violazioniValide);
                return;
            }

            const newSegnalazione: SegnalazioneCreationData = { geoarea_id: current_geoarea.geoarea_id, stato: "IN CORSO" };
            await this.createSegnalazione(newSegnalazione, violazioniValide);
        } else {
            await this.checkRientroSegnalazione(current_geoarea.geoarea_id);
        }
    }

    /**
     * Funzione che controlla se far passare in stato rientrata una segnalazione. Se nella geofence area specificata non ci sono segnalazioni in corso, non fa nulla.
     * @param geoarea_id numero che rappresenta l'id di una geofence area
     * @returns void.
     */
    public async checkRientroSegnalazione(geoarea_id: number) {
        const lastSegnalazioneInCorso = await this.segnalazioneDao.findLastInCorsoByGeoarea(geoarea_id);
        if (!lastSegnalazioneInCorso) {
            return;
        }

        const t = await DatabaseConnection.getInstance().transaction();
        try {
            await this.segnalazioneDao.update(lastSegnalazioneInCorso.id, { stato: "RIENTRATA" }, t);
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