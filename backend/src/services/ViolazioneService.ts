import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { GeofenceareaService } from './GeofenceareaService.js';
import { ViolazioneDAO } from '../dao/ViolazioneDAO.js';
import { ImbarcazioneService } from './ImbarcazioneService.js';
import { ViolazioneCreationData } from '../models/ViolazioneModel.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';

export class ViolazioneService {
    private readonly violazioneDAO = new ViolazioneDAO();
    private readonly geofenceareaService = new GeofenceareaService();
    private readonly imbarcazioneService = new ImbarcazioneService();
    /**
     * Per evitare di creare un Model intero per rappresentare la molti a molti, possiamo usare questo getter che usa Sequelize per restituire la tabella.
     */
    private get geofence_imbarcazioni() {
        return DatabaseConnection.getInstance().model('geofence_imbarcazioni');
    }

    /**
     * Funzione che crea una violazione in base ai dati passati. Il tipo di violazione può essere solo per eccesso di velocità o per accesso non autorizzato ad una geofence area.
     * @param data oggetto che implementa l'interfaccia ViolazioneCreationData, quindi che contiene tutti i dati necessari per creare una violazione.
     * @returns oggetto Violazione.
     */
    public async createViolazione(data: ViolazioneCreationData) {
        const t = await DatabaseConnection.getInstance().transaction();
        try {
            const geoarea = await this.geofenceareaService.getAreaById(data.geoarea_id);
            const imbarcazione = await this.imbarcazioneService.getImbarcazioneByMmsi(data.mmsi);
            if (!geoarea) {
                throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
            }
            if (!imbarcazione) {
                throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
            }
            if (!((data.tipo === 'ECCESSO VELOCITA') || (data.tipo === 'ACCESSO AREA NON AUTORIZZATA'))) {
                throw ErrorFactory.getError(AppErrorEnum.INVALID_STATO_VIOLAZIONE);
            }
            const result = await this.violazioneDAO.create(data, t);
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

    /**
     * Funzione che controlla se l'imbarcazione ha superato il limite di velocità della geofence area o se non ha l'autorizzazione per accedervi. In caso positivo, chiama la funzione per la generazione della violazione. In caso di doppia violazione, nel conteggio per le segnalazioni viene contata solo una. Se l'imbarcazione è fuori da una geofence area, non si genera nessuna violazione.
     * @param data oggetto che implementa l'interfaccia ViolazioneCreationData, quindi che contiene tutti i dati necessari per creare una violazione.
     * @returns void.
     */
    public async checkIfViolazione(data: DatiinviatiCreationData) {
        const current_area = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
        const allowedGeoareas = await this.geofence_imbarcazioni.findAll({ where: { mmsi: data.mmsi } }) as unknown as { geoarea_id: number; mmsi: number }[];

        if (!current_area) {
            return;
        }

        let violazioneGiaRegistrata = false;
        if (data.velocita_kmh > current_area.max_speed) {
            const dataViolazione: ViolazioneCreationData = { mmsi: data.mmsi, geoarea_id: current_area.geoarea_id, tipo: 'ECCESSO VELOCITA', conta_in_segnalazione: true };
            await this.createViolazione(dataViolazione);
            violazioneGiaRegistrata = true;
        }

        if (!allowedGeoareas.some(g => g.geoarea_id === current_area.geoarea_id)) {
            const dataViolazione: ViolazioneCreationData = { mmsi: data.mmsi, geoarea_id: current_area.geoarea_id, tipo: 'ACCESSO AREA NON AUTORIZZATA', conta_in_segnalazione: !violazioneGiaRegistrata };
            await this.createViolazione(dataViolazione);
        }
    }
}