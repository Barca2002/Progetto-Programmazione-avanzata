import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { AdminDAO } from '../dao/AdminDAO.js';
import { GeofenceareaDAO } from '../dao/GeofenceareaDAO.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { GeofenceImbarcazioniDAO } from '../dao/GeofenceImbarcazioniDAO.js';
import { LogSpostamenti } from '../models/LogSpostamentiModel.js';
import { Datiinviati } from '../models/DatiInviatiModel.js';
import { FeatureCollection } from 'geojson';


//Quì c'è tutta la logica di business, come devono essere gestiti i dati.
export class ImbarcazioneService {
  private imbarcazioneDAO = new ImbarcazioneDAO();
  private adminDAO = new AdminDAO();
  private geofenceareaDAO = new GeofenceareaDAO();
  private geofenceImbarcazioniDAO = new GeofenceImbarcazioniDAO();

  async createImbarcazione(data: ImbarcazioneCreationData) {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const utenteEsistente = await this.adminDAO.findById(data.user_id);
      if (!utenteEsistente) {
        throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
      }

      const result = await this.imbarcazioneDAO.create(data, t);
      
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

  async getImbarcazioneByMmsi(mmsi: number) {
    if (isNaN(mmsi) || mmsi <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
    if (!imbarcazione){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    return imbarcazione;
  }

  async getAllImbarcazioniWithGeofences() {
    const imbarcazioni = await this.imbarcazioneDAO.findAllGeofences();
    if (!imbarcazioni || imbarcazioni.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    return imbarcazioni;
  }

  async getMyImbarcazioniWithGeofences(user_id: number) {
    if (isNaN(user_id) || user_id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    const imbarcazioni = await this.imbarcazioneDAO.findAllWithUserWithGeofences(user_id);
    if (!imbarcazioni || imbarcazioni.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    return imbarcazioni;
  }

  async getLocationPerGeoarea(): Promise<object[]> {
    const imbarcazioni = await this.imbarcazioneDAO.findLastSpostamento();

    return imbarcazioni.map(imb => {
        const spostamenti = (imb.get('Spostamenti') as LogSpostamenti[]); 
        /*
        Per ogni geoarea dell'imbarcazione la query del DAO già torna un solo elemento con il timestamp più grande --> quindi otterrò un array di LogSpostamenti con tanti elementi quanti il numero di geoaree con log associati all'imbarcazione:
        Spostamenti: [
            { geoarea_id: 1, spostamento: 'ENTRATA', created_at: '2026-06-22 06:10:00' },
            { geoarea_id: 7, spostamento: 'USCITA',  created_at: '2026-06-21 19:15:00' },
            { geoarea_id: 8, spostamento: 'ENTRATA', created_at: '2026-06-20 18:30:00' },
            ...
        ]
        */

        return {
            mmsi: imb.mmsi,
            name: imb.name,
            spostamenti: spostamenti.map(s => ({
                geoarea_id: s.geoarea_id,
                stato: s.spostamento === 'ENTRATA' ? 'DENTRO' : 'FUORI',
                permanenza: s.spostamento === 'ENTRATA'
                    ? Math.floor((Date.now() - new Date(s.created_at).getTime()) / 60000)
                    : 0
            }))
        };
    });
  }

  async getPosizioniImbarcazione(mmsi: number, start_date: Date, end_date: Date): Promise<FeatureCollection> {
    if (!Number.isFinite(mmsi) || mmsi <= 0) {
        throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }

    const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
    if (!imbarcazione) {
        throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }

    if (!(start_date instanceof Date) || isNaN(start_date.getTime())) {
        throw ErrorFactory.getError(AppErrorEnum.INVALID_START_DATE);
    }

    if (!(end_date instanceof Date) || isNaN(end_date.getTime())) {
        throw ErrorFactory.getError(AppErrorEnum.INVALID_END_DATE);
    }

    if (start_date >= end_date) {
        throw ErrorFactory.getError(AppErrorEnum.INVALID_DATE_RANGE);
    }
    return await this.imbarcazioneDAO.getGeofenceAreasGeoJson(mmsi, start_date, end_date);
}

  async updateImbarcazione(mmsi: number, data: Partial<ImbarcazioneCreationData>) {
    if (!data || Object.keys(data).length === 0)
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      await this.imbarcazioneDAO.update(mmsi, data, t);
      await t.commit();
      return await this.imbarcazioneDAO.findById(mmsi);
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  }

  async deleteImbarcazione(mmsi: number) {
    const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.imbarcazioneDAO.delete(mmsi, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }

  async linkGeoareasToImbarcazioni(links: { mmsi: number, geoarea_ids: number[]}[]): Promise<void> {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      for (const { mmsi, geoarea_ids } of links) {
        
        //Controllo che l'imbarcazione esista
        const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
        if (!imbarcazione)
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

        //Controllo che tutte le geoareas esistano e che non siano già presenti
        for (const geoarea_id of geoarea_ids) {
          const geoarea = await this.geofenceareaDAO.findById(geoarea_id);
          if (!geoarea)
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);

          const associazioneEsistente = await this.geofenceImbarcazioniDAO.findAssociation(geoarea_id, mmsi);

          if (associazioneEsistente) {
            throw ErrorFactory.getError(AppErrorEnum.INVALID_ASSOCIATION);
          }
        }

        //Associo le geoaree
        await this.imbarcazioneDAO.linkGeoareas(mmsi, geoarea_ids, t);
      }

      await t.commit(); //se tutto è andato a buon fine viene scritto sul db
    } catch (err) {
      await t.rollback(); //se c'è un errore viene fatto il rollback della transazione e bisogna rimandare la richiesta
      if (err instanceof AppError) 
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  async getAllWithSegnalazioni(): Promise<Imbarcazione[]>{
    return await this.imbarcazioneDAO.findAllWithSegnalazioni();
  }

  async deleteGeoarea(mmsi: number, geoarea_id: number): Promise<void> {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      //Controllo che l'imbarcazione esista
      const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
      if (!imbarcazione)
        throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

      //Controllo che la geoarea esista
      const geoarea = await this.geofenceareaDAO.findById(geoarea_id);
      if (!geoarea)
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);

      //Controllo che l'associazione esista
      const associazione = await this.imbarcazioneDAO.findGeoareaAssociation(mmsi, geoarea_id);
      if (!associazione)
        throw ErrorFactory.getError(AppErrorEnum.ASSOCIAZIONE_NOT_FOUND);

      await this.imbarcazioneDAO.deleteGeoareaAssociation(mmsi, geoarea_id, t);
      await t.commit(); //se tutto è andato a buon fine scrivo sul db
    } catch (err) {
      await t.rollback(); //se è andato male faccio il rollback della transazione
      if (err instanceof AppError) throw err;
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }
}