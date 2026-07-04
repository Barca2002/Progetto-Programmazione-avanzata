import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { AdminDAO } from '../dao/AdminDAO.js';
import { GeofenceareaDAO } from '../dao/GeofenceareaDAO.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { Imbarcazione, ImbarcazioneCreationData, LinkDataBody, UnlinkDataBody } from '../models/ImbarcazioneModel.js';
import { FeatureCollection } from 'geojson';
import { GeofenceareaService } from './GeofenceareaService.js';
import { LogSpostamentiDAO } from '../dao/LogSpostamentiDAO.js';


export class ImbarcazioneService {
  private readonly imbarcazioneDAO = new ImbarcazioneDAO();
  private readonly adminDAO = new AdminDAO();
  private readonly geofenceareaDAO = new GeofenceareaDAO();
  private readonly geofenceareaService = new GeofenceareaService();
  private readonly logspostamentiDAO = new LogSpostamentiDAO();

  /**
   * Funzione che crea un'imbarcazione, segnalando se l'mmsi sia inserito e che non appartenga ad un'altra imbarcazione; si segnala anche se un'imbarcazione con il nome inserito è già presente e che l'utente esista
   * @param data contiene i dati necessari per la creazione dell'imbarcazione 
   * @returns oggetto imbarcazione 
   */
  public async createImbarcazione(data: ImbarcazioneCreationData) {
    if (!data.mmsi) {
      throw ErrorFactory.getError(AppErrorEnum.MISSING_MMSI);
    }
    const utenteEsistente = await this.adminDAO.get(data.user_id);
    if (!utenteEsistente) {
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }

    if (await this.imbarcazioneDAO.get(data.mmsi) || await this.imbarcazioneDAO.getByName(data.name)) {
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

  public async getImbarcazioneByMmsi(mmsi: number) {
    if (Number.isNaN(mmsi) || mmsi <= 0) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    return imbarcazione;
  }

  /**
   * Funzione che torna tutte le imbarcazioni con le geofence aree associate controllando se sono presenti effettivamente, le imbarcazioni
   * @returns lista di tutte le imbarcazioni con le proprie geofence aree associate 
   */
  public async getAllImbarcazioniWithGeofenceareas() {
    const imbarcazioni = await this.imbarcazioneDAO.getAll();
    if (!imbarcazioni || imbarcazioni.length === 0) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONI_NOT_FOUND);
    }
    return await this.generateImbarcazioniWithGeofenceareas(imbarcazioni);
  }

  /**
   * Funzione che controlla l'id utente che gli è stato passato e tramite esso prende tutte le sue imbarcazioni. Poi restituisce tutte le imbarcazioni con le geofence aree autorizzate, generate dalla funzione chiamata nel return.
   * @param user_id numero che rappresenta l'id dell'utente.
   * @returns lista d'imbarcazioni con le relative geofence aree autorizzate.
   */
  public async getUserImbarcazioniWithGeofenceareas(user_id: number) {
    if (Number.isNaN(user_id) || user_id <= 0) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    }
    const my_imbarcazioni = await this.imbarcazioneDAO.getAllByUserId(user_id);

    if (!my_imbarcazioni || my_imbarcazioni.length === 0) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    return await this.generateImbarcazioniWithGeofenceareas(my_imbarcazioni);
  }

  /**
   * Funzione che, in base alle imbarcazioni passate come argomento, restituisce per ognuna una lista di geofence aree autorizzate. Sono tolti alcuni attributi non necessari delle geofence aree.
   * @param imbarcazioni lista di oggetti Imbarcazione.
   * @returns lista di imbarcazioni con le relative geofence aree in formato JSON.
   */
  public async generateImbarcazioniWithGeofenceareas(imbarcazioni: Imbarcazione[]) {
    const result = [];

    for (const imbarcazione of imbarcazioni) {
      const associazioni = await imbarcazione.getGeofenceareas({ joinTableAttributes: [] });
      const associazioniFiltered = [];
      for (const associazione of associazioni) {
        associazioniFiltered.push({
          geoarea_id: associazione.geoarea_id,
          name: associazione.name,
          coordinates: associazione.area.coordinates,
          max_speed: associazione.max_speed ?? "Nessun limite di velocità",
          ultima_violazione_valida_id: associazione.ultima_violazione_valida_id,
          created_at: associazione.created_at
        });
      }
      result.push({ imbarcazione: imbarcazione.toJSON(), geofenceareas: associazioniFiltered });
    }
    return result;
  }

  /**
   * Restituisce lo stato delle imbarcazioni in base all'id della geofence area. Si prende l'ultimo spostamento di ogni barca e si controlla se è in uscita, allora l'imbarcazione sarà fuori, altrimenti è dentro e si calcola il tempo di permanenza.
   * @param imbarcazioni lista di oggetti Imbarcazione. 
   * @param geoarea_id numero che rappresenta l'id della geofence area.
   * @returns lista di imbarcazioni ed il relativo stato rispetto alla geofence area specificata in formato JSON.
   */
  public async generateImbarcazioniStatus(imbarcazioni: Imbarcazione[], geoarea_id: number) {
    const results = [];

    for (const imbarcazione of imbarcazioni) {
      const last_spostamento = await this.logspostamentiDAO.getLastByMmsiAndGeoarea(imbarcazione.mmsi, geoarea_id);

      if (!last_spostamento || last_spostamento.spostamento === 'USCITA') {
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'FUORI' });
        continue;
      }

      const diff = Date.now() - last_spostamento.created_at.getTime();
      const giorni = Math.floor(diff / 86400000);
      const ore = Math.floor((diff % 86400000) / 3600000);
      const minuti = Math.floor((diff % 3600000) / 60000);

      results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'DENTRO', permanenza: `${giorni}g ${ore}h ${minuti}m` });
    }
    return results;
  }

  /**
   * Retsituisce lo stato delle proprie imbarcazioni in una certa geofence area, cioè se si trova dentro o fuori da essa. Si controlla se la geofence area esiste 
   * @param user_id numero che rappresenta l'id dell'utente.
   * @param geoarea_id numero che rappresenta l'id della geofence area.
   * @returns insieme di imbarcazioni con il relativo stato in una geoarea, con tempo di permanenza se dentro di essa.
   */
  public async getMyImbarcazioniStatus(user_id: number, geoarea_id: number) {
    if (Number.isNaN(geoarea_id) || geoarea_id <= 0) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID)
    }
    // Controllo se la geoarea esiste, se non esiste viene lanciata un'eccezione.
    await this.geofenceareaService.getAreaById(geoarea_id);

    const my_imbarcazioni = await this.imbarcazioneDAO.getAllByUserId(user_id);

    if (!my_imbarcazioni || my_imbarcazioni.length === 0) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONI_NOT_FOUND);
    }


    return this.generateImbarcazioniStatus(my_imbarcazioni, geoarea_id);
  }

  /**
   * Funzione che restituisce lo stato (dentro/fuori dalla geofence area) di tutte le imbarcazioni rispetto a una specifica geoarea, controllando che l'id della geoarea sia valido e che la geoarea esista.
   * @param geoarea_id identificatore numerico della geofence area rispetto a cui calcolare lo stato delle imbarcazioni
   * @returns array/oggetto con lo stato di ogni imbarcazione rispetto alla geoarea indicata
   */
  public async getAllImbarcazioniStatus(geoarea_id: number) {
    if (Number.isNaN(geoarea_id) || geoarea_id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID)

    await this.geofenceareaService.getAreaById(geoarea_id);

    const imbarcazioni = await this.imbarcazioneDAO.getAll();

    return this.generateImbarcazioniStatus(imbarcazioni, geoarea_id);
  }

  /**
 * Funzione che restituisce tutte le posizioni di un'imbarcazione in un range di date, in formato GeoJson, controllando che l'imbarcazione esista e convertendo le date inserite (in formato italiano) in formato ISO/americano, leggibile dal database
 * @param mmsi identificatore unico dell'imbarcazione
 * @param start_date stringa con data di inizio ricerca (formato italiano gg-mm-aaaa o gg/mm/aaaa)
 * @param end_date stringa con data di fine ricerca (formato italiano gg-mm-aaaa o gg/mm/aaaa)
 * @returns oggetto GeoJson (FeatureCollection) con le posizioni dell'imbarcazione come punti
 */
  public async getPosizioniImbarcazioneAsGeoJson(mmsi: number, start_date: string, end_date: string): Promise<FeatureCollection> {
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
    if (!imbarcazione){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    const parsed_start_date = new Date(start_date.split(/[-/]/).reverse().join('-'));
    const parsed_end_date = new Date(end_date.split(/[-/]/).reverse().join('-'));
  if (parsed_start_date > parsed_end_date){
    throw ErrorFactory.getError(AppErrorEnum.INVALID_DATE_RANGE);
  }
    const dati = await this.imbarcazioneDAO.getPositionsByMmsiAndDateRange(mmsi, parsed_start_date, parsed_end_date);

    return {
      type: 'FeatureCollection',
      features: dati.map(d => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(d.longitudine), Number(d.latitudine)]
        },
        properties: {}
      }))
    };
  }

  /**
   * Funzione che ritorna tutte le imbarcazioni con le proprie segnalazioni associate
   * @returns lista di tutte le imbarcazioni con le segnalazioni associate
   */
  public async getAllImbarcazioniWithSegnalazioni() {
    const imbarcazioni = await this.imbarcazioneDAO.getAll();

    if (!imbarcazioni || imbarcazioni.length === 0) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONI_NOT_FOUND)
    }

    return await this.getImbarcazioniWithSegnalazioni(imbarcazioni);
  }

  /**
   * Funzione che prende tutte le imbarcazioni di un utente, se le trova restituisce anche le loro segnalazioni.
   * @param user_id numero che rappresenta l'id dell'utente.
   * @returns lista d'imbarcazioni con le relative segnalazioni in formato JSON.
   */
  public async getUserImbarcazioniWithSegnalazioni(user_id: number) {
    const my_imbarcazioni = await this.imbarcazioneDAO.getAllByUserId(user_id);

    if (!my_imbarcazioni || my_imbarcazioni.length === 0) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONI_NOT_FOUND)
    }

    return await this.getImbarcazioniWithSegnalazioni(my_imbarcazioni);
  }

  /**
   * Funzione che ritorna tutte le imbarcazioni di un utente con le relative segnalazioni. Se un'imbarcazione non ha segnalazioni, non viene inclusa nel risultato.
   * @param imbarcazioni lista di oggetti Imbarcazione.
   * @returns lista di imbarcazioni con le relative segnalazioni in formato JSON.
   */
  public async getImbarcazioniWithSegnalazioni(imbarcazioni: Imbarcazione[]) {
    const result = [];
    for (const imbarcazione of imbarcazioni) {
      const segnalazioni = await imbarcazione.getSegnalazioni({
        joinTableAttributes: []
      });
      if (segnalazioni.length === 0) {
        continue;
      }
      // Togliamo il campo created_at anche dall'imbarcazione.
      result.push({ imbarcazione: imbarcazione, segnalazioni });
    }
    return result;
  }

  /**
   * Funzione che dissocia una geofence area da un'imbarcazione controllando prima che l'imbarcazione, la geofence area e la loro associazione esistano.
   * @param unlink oggetto che contiene i dati per dissociare una geofence area da un'imbarcazione
   */
  public async unlinkGeoareaImbarcazione(unlink: UnlinkDataBody) {
    try {
      const imbarcazione = await this.imbarcazioneDAO.get(unlink.mmsi);
      if (!imbarcazione) {
        throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
      }
      const geoarea = await this.geofenceareaDAO.get(unlink.geoarea_id);
      if (!geoarea) {
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
      }
      const associazione = await imbarcazione.hasGeofencearea(unlink.geoarea_id);
      if (!associazione) {
        throw ErrorFactory.getError(AppErrorEnum.ASSOCIAZIONE_NOT_FOUND);
      }
      await imbarcazione.removeGeofencearea(unlink.geoarea_id);
    } catch (err) {
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }

  /**
 * Funzione che associa una o più imbarcazioni alle geofence aree indicate, verificando che ogni imbarcazione e ogni geofence area esista e che non sia già presente un'associazione fra di esse.L'operazione utilizza una transazione perché gli inserimenti avvengono in blocco: se anche una sola associazione risulta non valida, viene eseguito il rollback di tutte le associazioni create fino a quel momento, così da garantire che vengano salvate solo se tutte le associazioni richieste sono valide.
 * @param links vettore di oggetti contenenti l'mmsi dell'imbarcazione e gli id delle geofence aree da associare
 */
  public async linkGeoareasToImbarcazioni(links: LinkDataBody[]) {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      for (const { mmsi, geoarea_ids } of links) {
        const imbarcazione = await this.imbarcazioneDAO.get(mmsi);
        if (!imbarcazione) {
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
        }
        for (const geoarea_id of geoarea_ids) {
          const geoarea = await this.geofenceareaDAO.get(geoarea_id);
          if (!geoarea) {
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
          }
          const associazioneEsistente = await imbarcazione.hasGeofencearea(geoarea_id);
          if (associazioneEsistente) {
            throw ErrorFactory.getError(AppErrorEnum.INVALID_ASSOCIATION);
          }
          await imbarcazione.addGeofencearea(geoarea_id, { transaction: t });
        }
      }
      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  public async checkOwnershipImbarcazione(user_id: number, mmsi: number): Promise<boolean> {
    // Controlliamo se l'user_id dell'imbarcazione e l'user_id dell'utente sono uguali, verificando quindi se l'imbarcazione è di proprietà dell'utente.
    const imbarcazione = await this.getImbarcazioneByMmsi(mmsi);
    if (imbarcazione?.user_id !== user_id) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_OWNERSHIP_ERROR);
    }
    return true;
  }
}