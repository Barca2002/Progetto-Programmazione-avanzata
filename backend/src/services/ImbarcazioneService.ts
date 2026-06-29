import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { AdminDAO } from '../dao/AdminDAO.js';
import { GeofenceareaDAO } from '../dao/GeofenceareaDAO.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { LogSpostamenti } from '../models/LogSpostamentiModel.js';
import { FeatureCollection } from 'geojson';
import { Datiinviati } from '../models/DatiInviatiModel.js';
import { LogSpostamentiDAO } from '../dao/LogSpostamentiDAO.js';
import { SegnalazioneDAO } from '../dao/SegnalazioneDAO.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';


//Quì c'è tutta la logica di business, come devono essere gestiti i dati.
export class ImbarcazioneService {
  private imbarcazioneDAO = new ImbarcazioneDAO();
  private adminDAO = new AdminDAO();
  private geofenceareaDAO = new GeofenceareaDAO();
  private logSpostamentiDAO = new LogSpostamentiDAO();
  private segnalazioneDAO = new SegnalazioneDAO();
  //Il codice viene eseguito solo quando si chiama this.geofence_imbarcazioni dentro un metodo, nel momento in cui si lancia new ImbarcazioneService()
  private get geofence_imbarcazioni() {
    return DatabaseConnection.getInstance().model('geofence_imbarcazioni');
  }


  async createImbarcazione(data: ImbarcazioneCreationData) {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const utenteEsistente = await this.adminDAO.get(data.user_id);
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
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    return imbarcazione;
  }

  async getAllImbarcazioniWithGeofences() {
    const imbarcazioni = await this.imbarcazioneDAO.getAll();
    if (!imbarcazioni || imbarcazioni.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    const result = [];

    for (const imbarcazione of imbarcazioni) {
      const associazioni = await this.geofence_imbarcazioni.findAll({ where: { mmsi: imbarcazione.mmsi } }) as unknown as { geoarea_id: number; mmsi: number }[];

      const geoareas: Geofencearea[] = [];
      for (const associazione of associazioni) {
        const geoarea = await this.geofenceareaDAO.get(associazione.geoarea_id);
        if (!geoarea)
          throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        geoareas.push(geoarea);
      }

      result.push({ imbarcazione: imbarcazione.toJSON(), Geoareas: geoareas });
    }

    return result;
  }

  async getMyImbarcazioniWithGeofences(user_id: number): Promise<Imbarcazione[]> {
    if (isNaN(user_id) || user_id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);

    const my_imbarcazioni = await this.imbarcazioneDAO.getAllByUserId(user_id);

    if (!my_imbarcazioni || my_imbarcazioni.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    const result = [];

    for (const imbarcazione of my_imbarcazioni) {
      const associazioni = await this.geofence_imbarcazioni.findAll({ where: { mmsi: imbarcazione.mmsi } }) as unknown as { geoarea_id: number; mmsi: number }[];

      // Se si vogliono escludere le imbarcazioni con 0 geoaree associate decommentare
      if (associazioni.length === 0)
        continue;

      const geoareas: { geoarea_id: number, name: string }[] = [];
      for (const associazione of associazioni) {
        const geoarea = await this.geofenceareaDAO.get(associazione.geoarea_id);
        if (!geoarea)
          throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        geoareas.push({ geoarea_id: geoarea.geoarea_id, name: geoarea.name });

      }

      result.push({ ...imbarcazione.toJSON(), Geofenceareas: geoareas });
    }

    return result;
  }

  async findAllLastSpostamento() {
    const imbarcazioni: Imbarcazione[] = await this.imbarcazioneDAO.getAll();
    const spostamenti: LogSpostamenti[] = await this.logSpostamentiDAO.getAll();
    /*
    spostamenti =
    [
      { "log_id": 1, "mmsi": 123, "geoarea_id": 3, "created_at": "08:00" },
      { "log_id": 2, "mmsi": 456, "geoarea_id": 5, "created_at": "09:00" },
      { "log_id": 3, "mmsi": 123, "geoarea_id": 3, "created_at": "10:00" },
      { "log_id": 4, "mmsi": 123, "geoarea_id": 7, "created_at": "07:00" }
    ]
    */

    return imbarcazioni.map(imbarcazione => {

      //1) Prendo tutti gli spostamenti di quell'imbarcazione e li ordino per created_at decrescente
      const spostamenti_imbarcazione: LogSpostamenti[] = spostamenti
        .filter(s => s.mmsi === imbarcazione.mmsi)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

      /*
      spostamenti_imbarcazione = 
      [
        { "log_id": 3, "mmsi": 123, "geoarea_id": 3, "created_at": "10:00" },
        { "log_id": 1, "mmsi": 123, "geoarea_id": 3, "created_at": "08:00" },
        { "log_id": 4, "mmsi": 123, "geoarea_id": 7, "created_at": "07:00" }
      ]
      */

      //Vettore che contiene le geoaree associate a quell'imbarcazione
      const geoaree_imbarcazione: number[] = [];

      //2) Serve per prendere solo l'ultimo spostamento di ogni geoarea associata
      const ultimi_spostamenti = spostamenti_imbarcazione.filter(s => {
        if (geoaree_imbarcazione.includes(s.geoarea_id))
          return false; //serve a dire a .filter di non usare un elemento (return false), quando è già nel vettore
        geoaree_imbarcazione.push(s.geoarea_id);
        return true;
      });

      /*
      ultimi_spostamenti = 
      [
        { "log_id": 3, "mmsi": 123, "geoarea_id": 3, "created_at": "10:00" },
        { "log_id": 4, "mmsi": 123, "geoarea_id": 7, "created_at": "07:00" }
      ]
      */

      //Per ogni elemento di imbarcazioni, costruisco il json con le informazioni sull'imbarcazione con un vettore di LogSpostamenti contenente per ogni geoarea solo l'ultimo spostamento
      return { Imbarcazione: imbarcazione.toJSON(), Spostamenti: ultimi_spostamenti };
    });
  }

  async getStatusPerGeoarea(): Promise<object[]> {
    const imbarcazioni = await this.findAllLastSpostamento();

    return imbarcazioni.map(imb => {
      const spostamenti = imb.Spostamenti;
      return {
        mmsi: imb.Imbarcazione.mmsi,
        name: imb.Imbarcazione.name,
        spostamenti: spostamenti.map(s => ({
          geoarea_id: s.geoarea_id,
          stato: s.spostamento === 'ENTRATA' ? 'DENTRO' : 'FUORI',
          permanenza: s.spostamento === 'ENTRATA'
            ? Math.floor((Date.now() - new Date(s.created_at).getTime()) / 60000)
            : 0
        }))
      }; 
    //Per non mostrare le imbarcazioni senza spostamenti si usa il filter
    }).filter(imb => imb.spostamenti.length > 0);
  }

  async getPosizioniImbarcazioneAsGeoJson(mmsi: number, start_date: Date, end_date: Date): Promise<FeatureCollection> {
    if (!Number.isFinite(mmsi) || mmsi <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);

    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    if (!(start_date instanceof Date) || isNaN(start_date.getTime()))
      throw ErrorFactory.getError(AppErrorEnum.INVALID_START_DATE);

    if (!(end_date instanceof Date) || isNaN(end_date.getTime()))
      throw ErrorFactory.getError(AppErrorEnum.INVALID_END_DATE);

    if (start_date >= end_date)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_DATE_RANGE);

    const dati = await this.imbarcazioneDAO.getPositionsByMmsiAndDateRange(mmsi, start_date, end_date);

    return {
      type: 'FeatureCollection',
      features: dati.map((d: Datiinviati) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(d.longitudine), Number(d.latitudine)]
        },
        properties: {}
      }))
    };
  }

  async getPosizioniImbarcazione(mmsi: number, start_date: Date, end_date: Date): Promise<FeatureCollection> {
    if (!Number.isFinite(mmsi) || mmsi <= 0) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }

    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
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
    return await this.getPosizioniImbarcazioneAsGeoJson(mmsi, start_date, end_date);
  }

  async updateImbarcazione(mmsi: number, data: Partial<ImbarcazioneCreationData>) {
    if (!data || Object.keys(data).length === 0)
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      await this.imbarcazioneDAO.update(mmsi, data, t);
      await t.commit();
      return await this.imbarcazioneDAO.get(mmsi);
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  }

  async deleteImbarcazione(mmsi: number) {
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.imbarcazioneDAO.delete(mmsi, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }

  async linkGeoareasToImbarcazioni(links: { mmsi: number, geoarea_ids: number[] }[]): Promise<void> {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      for (const { mmsi, geoarea_ids } of links) {

        //Controllo che l'imbarcazione esista
        const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
        if (!imbarcazione)
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

        //Controllo che tutte le geoareas esistano e che non siano già presenti
        for (const geoarea_id of geoarea_ids) {
          const geoarea = await this.geofenceareaDAO.get(geoarea_id);
          if (!geoarea) {
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
          }
          // Passiamo anche la transazione perché ad ogni iterazione ci sono dei dati in sospeso e per controllarli serve la transazione. Altrimenti le associazioni in sospeso non vengono controllate, quindi si possono inserire associazioni duplicate.
          const associazioneEsistente = await this.geofence_imbarcazioni.findOne({ where: { geoarea_id: geoarea_id, mmsi: imbarcazione.mmsi } }) as unknown as { geoarea_id: number; mmsi: number } | null;

          if (associazioneEsistente) {
            throw ErrorFactory.getError(AppErrorEnum.INVALID_ASSOCIATION);
          }
          //Associo le geoaree
          await this.geofence_imbarcazioni.create({ geoarea_id, mmsi }, {transaction: t});
        }
      }

      await t.commit(); //se tutto è andato a buon fine viene scritto sul db
    } catch (err) {
      await t.rollback(); //se c'è un errore viene fatto il rollback della transazione e bisogna rimandare la richiesta
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  async getAllWithSegnalazioni() {
    const imbarcazioni = await this.imbarcazioneDAO.getAll();
    const result = [];

    for (const imbarcazione of imbarcazioni) {
      const segnalazioni = await this.segnalazioneDAO.findAllByMmsi(imbarcazione.mmsi);
      result.push({ imbarcazione: imbarcazione.toJSON(), segnalazioni });
    }

    return result;
  }


  async deleteGeoarea(mmsi: number, geoarea_id: number): Promise<void> {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      //Controllo che l'imbarcazione esista
      const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
      if (!imbarcazione)
        throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

      //Controllo che la geoarea esista
      const geoarea = await this.geofenceareaDAO.get(geoarea_id);
      if (!geoarea)
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);

      //Controllo che l'associazione esista
      const associazione = await this.geofence_imbarcazioni.findOne({ where: { mmsi: imbarcazione.mmsi, geoarea_id: geoarea_id } }) as unknown as { geoarea_id: number; mmsi: number } | null;
      if (!associazione)
        throw ErrorFactory.getError(AppErrorEnum.ASSOCIAZIONE_NOT_FOUND);

      await this.geofence_imbarcazioni.destroy({ where: { mmsi: mmsi, geoarea_id: geoarea_id }, transaction: t });
      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) 
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }

  async checkOwnershipImbarcazione(user_id: number, mmsi: number): Promise<boolean> {
    // Controlliamo se l'user_id dell'imbarcazione e l'user_id dell'utente sono uguali, verificando quindi se l'imbarcazione è di proprietà dell'utente.
    const imbarcazione = await this.getImbarcazioneByMmsi(mmsi);
    if (imbarcazione?.user_id !== user_id) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_OWNERSHIP_ERROR);
    }
    return true;
  }
}