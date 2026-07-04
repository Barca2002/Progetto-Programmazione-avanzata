import { Op, Transaction } from 'sequelize';
import { Violazione, ViolazioneCreationData } from '../models/ViolazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';

export class ViolazioneDAO implements InterfacciaDAO<Violazione> {

  /**
   * Funzione che crea una nuova violazione nel database, attraverso una transazione, che nel caso di errore esegue un rollback e non permette la creazione
   * @param data oggetto che contiene i dati necessari per la creazione di una violazione
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto Violazione
   */
  public async create(data: ViolazioneCreationData, t: Transaction): Promise<Violazione> {
    return await Violazione.create(data, { transaction: t });
  }

  /**
   * Funzione che restituisce una violazione tramite il suo id, oppure null se non esiste
   * @param violazione_id identificatore univoco della violazione
   * @returns oggetto Violazione trovato, oppure null se non esiste
   */
  public async get(violazione_id: number): Promise<Violazione | null> {
    return await Violazione.findByPk(violazione_id);
  }

  /**
   * Funzione che restituisce tutte le violazioni presenti
   * @returns array di oggetti Violazione
   */
  public async getAll(): Promise<Violazione[]> {
    return await Violazione.findAll();
  }

  /**
   * Funzione che aggiorna i dati di una violazione tramite il suo id, attraverso una transazione
   * @param violazione_id identificatore univoco della violazione da aggiornare
   * @param new_data oggetto con i campi da aggiornare (parziale rispetto a tutti i campi della violazione)
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto Violazione
   */
  public async update(violazione_id: number, new_data: Partial<ViolazioneCreationData>, t: Transaction): Promise<Violazione> {
    const violazione = await Violazione.findByPk(violazione_id);
    return await violazione!.update(new_data, { transaction: t });
  }

  /**
   * Ritorna l'ultima violazione valida di una geofence area.
   * @param geoarea_id numero che rappresenta l'id della geofence area.
   * @returns oggetto Violazione o null.
   */
  public async getUltimaViolazioneValida(geoarea_id: number): Promise<Violazione | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    return await Violazione.findOne({ where: { id: geoarea?.ultima_violazione_valida_id } })
  }

  /**
   * Funzione che restituisce tutte le violazioni associate a una specifica imbarcazione, identificata tramite mmsi
   * @param mmsi identificatore unico dell'imbarcazione
   * @returns array di oggetti Violazione, oppure null se non esiste alcuna violazione per quell'imbarcazione
   */
  public async getAllByMmsi(mmsi: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { mmsi } });
  }

  /**
   * Funzione che restituisce le violazioni recenti  di una geofence area che contano ai fini di una segnalazione, calcolando una finestra temporale di 2 giorni a partire dalla data dell'ultima violazione valida registrata sulla geoarea.
   * @param geoarea_id identificatore univoco della geofence area
   * @returns array di oggetti Violazione, ordinati per data di creazione decrescente, oppure null se non esiste alcuna violazione
   */
  public async getRecentByGeoarea(geoarea_id: number): Promise<Violazione[] | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    const ultimaViolazioneValida = await Violazione.findOne({ where: { id: geoarea!.ultima_violazione_valida_id } });
    return await Violazione.findAll({
      where: {
        geoarea_id,
        conta_in_segnalazione: true,
        created_at: {
          [Op.gte]: ultimaViolazioneValida!.created_at.getTime() - 2 * 24 * 60 * 60 * 1000,
        },
      },
      order: [["created_at", "DESC"]],
    });
  }

  /**
   * Funzione che restituisce tutte le violazioni associate a una specifica geofence area, ordinate per data di creazione decrescente
   * @param geoarea_id identificatore univoco della geofence area
   * @returns array di oggetti Violazione, oppure null se non esiste alcuna violazione per quella geoarea
   */
  public async getAllByGeoarea(geoarea_id: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { geoarea_id }, order: [["created_at", "DESC"]] });
  }
}