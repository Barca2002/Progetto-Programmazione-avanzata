import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { AdminDAO } from '../dao/AdminDAO.js';
import { GeofenceareaDAO } from '../dao/GeofenceareaDAO.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { Imbarcazione, ImbarcazioneCreationData, LinkDataBody, UnlinkDataBody } from '../models/ImbarcazioneModel.js';
import { FeatureCollection } from 'geojson';
import { Datiinviati } from '../models/DatiInviatiModel.js';
import { GeofenceareaService } from './GeofenceareaService.js';
import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';


export class ImbarcazioneService {
  private readonly imbarcazioneDAO = new ImbarcazioneDAO();
  private readonly adminDAO = new AdminDAO();
  private readonly geofenceareaDAO = new GeofenceareaDAO();
  private readonly geofenceareaService = new GeofenceareaService();
  private readonly datiinviatiDAO = new DatiinviatiDAO();

  // Usata dall'adminController tramite imbarcazioneController.
  async createImbarcazione(data: ImbarcazioneCreationData) {
    if (!data.mmsi){
      throw ErrorFactory.getError(AppErrorEnum.MISSING_MMSI);
    }
    const utenteEsistente = await this.adminDAO.get(data.user_id);
      if (!utenteEsistente) {
        throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
      }

    if(await this.imbarcazioneDAO.get(data.mmsi) || await this.imbarcazioneDAO.getByName(data.name)){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_ALREADY_EXISTS);
    }
    const t = await DatabaseConnection.getInstance().transaction();
    try {
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
    if (Number.isNaN(mmsi) || mmsi <= 0){
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    return imbarcazione;
  }

  async getAllImbarcazioniWithGeofenceareas() {
    const imbarcazioni = await this.imbarcazioneDAO.getAll();
    if (!imbarcazioni || imbarcazioni.length === 0){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    return await this.generateImbarcazioniWithGeofenceareas(imbarcazioni);
  }

  async getUserImbarcazioniWithGeofenceareas(user_id: number) {
    if (Number.isNaN(user_id) || user_id <= 0){
      throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    }
    const my_imbarcazioni = await this.imbarcazioneDAO.getAllByUserId(user_id);

    if (!my_imbarcazioni || my_imbarcazioni.length === 0){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    return await this.generateImbarcazioniWithGeofenceareas(my_imbarcazioni);
  }

  // Usata dalle funzioni precedenti (sia user che admin) per generare il json con le imbarcazioni e le corrispondenti geoaree associate.
  async generateImbarcazioniWithGeofenceareas(imbarcazioni: Imbarcazione[]){
    const result = [];

    for (const imbarcazione of imbarcazioni) {
      const associazioni = await imbarcazione.getGeofenceareas({joinTableAttributes: []}); // Togliamo gli attributi della molti a molti dalle associazioni.
      const associazioniFiltered = []; // Togliamo gli attributi non necessari.
      for (const associazione of associazioni){
        associazioniFiltered.push({ geoarea_id: associazione.geoarea_id, name: associazione.name, coordinates: associazione.area.coordinates, max_speed: associazione.max_speed ?? "Nessun limite di velocità", ultima_violazione_valida_id: associazione.ultima_violazione_valida_id, created_at: associazione.created_at });
      }
      result.push({ imbarcazione: imbarcazione.toJSON(), geofenceareas: associazioniFiltered });
    }
    return result;
  }

  async generateImbarcazioniStatus(imbarcazioni: Imbarcazione[], geoarea_id: number) {
    const results = [];

    for (const imbarcazione of imbarcazioni) {
      //Prendi l'ultimo dato inviato, associato all'imbarcazione
      const last_dato = await this.datiinviatiDAO.getLastDatoByMmsi(imbarcazione.mmsi);
      if (!last_dato) {
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'FUORI' });
        continue; //Se non c'è continuo comunque dicendo che è fuori
      }

      //Prendo la geoarea associata all'ultimo dato
      const geoarea_last_dato = await this.geofenceareaService.getGeoareaByPosition(last_dato.longitudine, last_dato.latitudine);

      // Siccome l'utente può inviare posizioni anche che non siano di geoaree, dico comunque che è fuori
      if (!geoarea_last_dato) {
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'FUORI' });
        continue; //Se non c'è continuo comunque dicendo che è fuori
      }

      //Se l'id della geoarea associato all'ultimo invio di dati per quell'imbarcazione è uguale a quello inserito nel body, vuol dire che è dentro quella geoarea
      if (geoarea_last_dato.geoarea_id === geoarea_id) {
        const diff = Date.now() - last_dato.created_at;
        const giorni = Math.floor(diff / 86400000);
        const ore = Math.floor((diff % 86400000) / 3600000);
        const minuti = Math.floor((diff % 3600000) / 60000);
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'DENTRO', permanenza: `${giorni}g ${ore}h ${minuti}m` });
      } else {
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'FUORI' });
      }
    }

    return results;
  }

  //FUNZIONE USATA DA USERCONTROLLER PER TORNARE LO STATO DELLE PROPRIE IMBARCAZIONI
  async getMyImbarcazioniStatus(user_id: number, geoarea_id: number) {
    if (Number.isNaN(geoarea_id) || geoarea_id <= 0){
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID)
    }
    // Controllo se la geoarea esiste, se non esiste viene lanciata un'eccezione.
    await this.geofenceareaService.getAreaById(geoarea_id);

    const my_imbarcazioni = await this.imbarcazioneDAO.getAllByUserId(user_id);

    if (!my_imbarcazioni || my_imbarcazioni.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    return this.generateImbarcazioniStatus(my_imbarcazioni, geoarea_id);
  }

  //FUNZIONE USATA DA ADMINCONTROLLER PER TORNARE LO STATO DI TUTTE LE IMBARCAZIONI IN UNA GEOAREA
  async getAllImbarcazioniStatus(geoarea_id: number) {
    if (Number.isNaN(geoarea_id) || geoarea_id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID)

    await this.geofenceareaService.getAreaById(geoarea_id);

    const imbarcazioni = await this.imbarcazioneDAO.getAll();

    return this.generateImbarcazioniStatus(imbarcazioni, geoarea_id);
  }


  async getPosizioniImbarcazioneAsGeoJson(mmsi: number, start_date: string, end_date: string): Promise<FeatureCollection> {
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    //Converto la data di inizio nel tipo Date
    const parsed_start_date = new Date(start_date.split(/[-/]/).reverse().join('-'));

    //Controlla il contenuto: se quei numeri, una volta interpretati come giorno-mese-anno, formano una data che esiste davvero. Nel caso formassero una data sbagliata il getTime() tornerebbe NaN
    if (Number.isNaN(parsed_start_date.getTime()))
      throw ErrorFactory.getError(AppErrorEnum.INVALID_START_DATE);

    //Converto la data di fine nel tipo Date
    const parsed_end_date = new Date(end_date.split(/[-/]/).reverse().join('-'));

    //Controlla il contenuto: se quei numeri, una volta interpretati come giorno-mese-anno, formano una data che esiste davvero. Nel caso formassero una data sbagliata il getTime() tornerebbe NaN
    if (Number.isNaN(parsed_end_date.getTime()))
      throw ErrorFactory.getError(AppErrorEnum.INVALID_END_DATE);

    if (parsed_start_date > parsed_end_date)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_DATE_RANGE);

    const dati = await this.imbarcazioneDAO.getPositionsByMmsiAndDateRange(mmsi, parsed_start_date, parsed_end_date);

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

  async getAllImbarcazioniWithSegnalazioni() {
    const imbarcazioni = await this.imbarcazioneDAO.getAll();

    if(!imbarcazioni || imbarcazioni.length === 0){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONI_NOT_FOUND)
    }

    return await this.getImbarcazioniWithSegnalazioni(imbarcazioni);
  }

  async getUserImbarcazioniWithSegnalazioni(user_id: number) {
    const my_imbarcazioni = await this.imbarcazioneDAO.getAllByUserId(user_id);

    if(!my_imbarcazioni || my_imbarcazioni.length === 0){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONI_NOT_FOUND)
    }

    return await this.getImbarcazioniWithSegnalazioni(my_imbarcazioni);
  }

  // Ritorna una lista di imbarcazioni con le relative segnalazioni. Se un'imbarcazione non ha segnalazioni, non viene inclusa nel risultato.
  async getImbarcazioniWithSegnalazioni(imbarcazioni: Imbarcazione[]) {
    const result = [];
    for (const imbarcazione of imbarcazioni) {
      const segnalazioni = await imbarcazione.getSegnalazioni({joinTableAttributes: []
      }); // Togliamo gli attributi della tabella molti a molti.
      if (segnalazioni.length === 0) {
        continue; // Se non ci sono segnalazioni per questa imbarcazione, saltiamo l'iterazione.
      }
      // Togliamo il campo created_at anche dall'imbarcazione.
      result.push({ imbarcazione: imbarcazione, segnalazioni });
    }
    return result;
  }

  async unlinkGeoareaImbarcazione(unlink: UnlinkDataBody) {
    try {
      //Controllo che l'imbarcazione esista
      const imbarcazione = await this.imbarcazioneDAO.get(unlink.mmsi);
      if (!imbarcazione){
        throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
      }

      //Controllo che la geoarea esista
      const geoarea = await this.geofenceareaDAO.get(unlink.geoarea_id);
      if (!geoarea){
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
      }
        
      //Controllo che l'associazione esista
      const associazione = await imbarcazione.hasGeofencearea(unlink.geoarea_id);
      if (!associazione){
        throw ErrorFactory.getError(AppErrorEnum.ASSOCIAZIONE_NOT_FOUND);
      }
        
      await imbarcazione.removeGeofencearea(unlink.geoarea_id);
    } catch (err) {
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }

  async linkGeoareasToImbarcazioni(links: LinkDataBody[]){
    // La transazione è necessaria perché si può linkare un imbarcazione a più geoaree più volte. 
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      for (const { mmsi, geoarea_ids } of links) {

        //Controllo che l'imbarcazione esista
        const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
        if (!imbarcazione) {
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
        }

        //Controllo che tutte le geoareas esistano e che non siano già presenti
        for (const geoarea_id of geoarea_ids) {
          const geoarea = await this.geofenceareaDAO.get(geoarea_id);
          if (!geoarea) {
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
          }
          // Passiamo anche la transazione perché ad ogni iterazione ci sono dei dati in sospeso e per controllarli serve la transazione. Altrimenti le associazioni in sospeso non vengono controllate, quindi si possono inserire associazioni duplicate.
          const associazioneEsistente = await imbarcazione.hasGeofencearea(geoarea_id);

          if (associazioneEsistente) {
            throw ErrorFactory.getError(AppErrorEnum.INVALID_ASSOCIATION);
          }
          //Associo le geoaree
          await imbarcazione.addGeofencearea(geoarea_id, { transaction: t });
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

  async checkOwnershipImbarcazione(user_id: number, mmsi: number): Promise<boolean> {
    // Controlliamo se l'user_id dell'imbarcazione e l'user_id dell'utente sono uguali, verificando quindi se l'imbarcazione è di proprietà dell'utente.
    const imbarcazione = await this.getImbarcazioneByMmsi(mmsi);
    if (imbarcazione?.user_id !== user_id) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_OWNERSHIP_ERROR);
    }
    return true;
  }
}