import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { AdminDAO } from '../dao/AdminDAO.js';
import { GeofenceareaDAO } from '../dao/GeofenceareaDAO.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';


//Quì c'è tutta la logica di business, come devono essere gestiti i dati.
export class ImbarcazioneService {
  private imbarcazioneDAO = new ImbarcazioneDAO();
  private adminDAO = new AdminDAO();
  private geofenceareaDAO = new GeofenceareaDAO();

  async createImbarcazione(data: ImbarcazioneCreationData) {
    return await this.imbarcazioneDAO.create(data);
  }

  async getImbarcazioneById(mmsi: number) {
    const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    return imbarcazione;
  }

  async getAllImbarcazioniWithGeofences() {
    return await this.imbarcazioneDAO.findAllGeofences();
  }

  async getMyImbarcazioniWithGeofences(user_id: number) {
    return await this.imbarcazioneDAO.findAllWithUserWithGeofences(user_id);
  }

  async updateImbarcazione(mmsi: number, data: Partial<ImbarcazioneCreationData>) {
    const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    return await this.imbarcazioneDAO.update(mmsi, data);
  }

  async deleteImbarcazione(mmsi: number) {
    const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    return await this.imbarcazioneDAO.delete(mmsi);
  }

  async linkGeoareasEUserToImbarcazioni(links: { mmsi: number, geoarea_ids: number[], user_id: number }[]): Promise<void> {
    const db = DatabaseConnection.connect();
    const t = await db.transaction();

    try {
      for (const { mmsi, geoarea_ids, user_id } of links) {

        //Controllo che l'imbarcazione esista
        const imbarcazione = await this.imbarcazioneDAO.findById(mmsi, t);
        if (!imbarcazione)
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

        //Controllo che lo user esista
        const user = await this.adminDAO.findById(user_id, t);
        if (!user)
          throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);

        //Controllo che tutte le geoareas esistano
        for (const geoarea_id of geoarea_ids) {
          const geoarea = await this.geofenceareaDAO.findById(geoarea_id, t);
          if (!geoarea)
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        }

        //Controllo che l'imbarcazione non sia già associata ad un utente
        const associazioneEsistente = await this.imbarcazioneDAO.findUserAssociation(mmsi, t);
        if (associazioneEsistente)
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_ALREADY_ASSOCIATED);

        

        await this.imbarcazioneDAO.linkGeoareas(mmsi, geoarea_ids, t);
        await this.imbarcazioneDAO.linkUser(mmsi, user_id, t);
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) throw err;
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async deleteGeoarea(mmsi: number, geoarea_id: number): Promise<void> {
    const db = DatabaseConnection.connect();
    const t = await db.transaction();

    try {
      //Controllo che l'imbarcazione esista
      const imbarcazione = await this.imbarcazioneDAO.findById(mmsi, t);
      if (!imbarcazione)
        throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

      //Controllo che la geoarea esista
      const geoarea = await this.geofenceareaDAO.findById(geoarea_id, t);
      if (!geoarea)
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);

      //Controllo che l'associazione esista
      const associazione = await this.imbarcazioneDAO.findGeoareaAssociation(mmsi, geoarea_id, t);
      if (!associazione)
        throw ErrorFactory.getError(AppErrorEnum.ASSOCIAZIONE_NOT_FOUND);

      await this.imbarcazioneDAO.deleteGeoareaAssociation(mmsi, geoarea_id, t);
      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) throw err;
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}