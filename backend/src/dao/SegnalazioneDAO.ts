import { Transaction } from 'sequelize';
import { Segnalazione, SegnalazioneCreationData } from '../models/SegnalazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';

export class SegnalazioneDAO implements InterfacciaDAO<Segnalazione> {

  /**
   * Funzione che crea una nuova segnalazione nel database, attraverso una transazione, che nel caso di errore esegue un rollback e non permette la creazione
   * @param data oggetto che contiene i dati necessari per la creazione di una segnalazione
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto Segnalazione
   */
  public async create(data: SegnalazioneCreationData, t: Transaction): Promise<Segnalazione> {
    return await Segnalazione.create(data, { transaction: t });
  }

  /**
   * Funzione che restituisce una segnalazione tramite il suo id, oppure null se non esiste
   * @param segnalazione_id identificatore univoco della segnalazione
   * @returns oggetto Segnalazione, oppure null se non esiste
   */
  public async get(segnalazione_id: number): Promise<Segnalazione | null> {
    return await Segnalazione.findByPk(segnalazione_id);
  }

  /**
   * Funzione che restituisce tutte le segnalazioni presenti nel database
   * @returns array di oggetti Segnalazione
   */
  public async getAll(): Promise<Segnalazione[]> {
    return await Segnalazione.findAll();
  }

  /**
 * Funzione che aggiorna i dati di una segnalazione tramite il suo id, attraverso una transazione
 * @param segnalazione_id identificatore univoco della segnalazione da aggiornare
 * @param new_data oggetto con i campi da aggiornare (parziale rispetto a tutti i campi della segnalazione)
 * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
 * @returns oggetto Segnalazione
 */
  public async update(segnalazione_id: number, new_data: Partial<SegnalazioneCreationData>, t: Transaction): Promise<Segnalazione | null> {
    const segnalazione = await Segnalazione.findByPk(segnalazione_id);
    return await segnalazione!.update(new_data, { transaction: t });
  }

  /**
   * Funzione che restituisce tutte le segnalazioni associate a una specifica geofence area, ordinate per data di creazione decrescente
   * @param geoarea_id identificatore univoco della geofence area
   * @returns array di oggetti Segnalazione, oppure null se non esiste alcuna segnalazione per quella geoarea
   */
  public async getAllByGeoarea(geoarea_id: number): Promise<Segnalazione[] | null> {
    return await Segnalazione.findAll({ where: { geoarea_id }, order: [["created_at", "DESC"]] });
  }

  /**
   * Funzione che restituisce l'ultima segnalazione con stato "IN CORSO" per una specifica geofence area, in ordine di data di creazione decrescente
   * @param geoarea_id identificatore univoco della geofence area
   * @returns oggetto Segnalazione trovato, oppure null se non esiste
   */
  public async getLastInCorsoByGeoarea(geoarea_id: number): Promise<Segnalazione | null> {
    return await Segnalazione.findOne({ where: { geoarea_id, stato: 'IN CORSO' }, order: [["created_at", "DESC"]] });
  }

  /**
   * Funzione che restituisce tutte le segnalazioni associate a una specifica imbarcazione, recuperando prima gli id delle segnalazioni collegate tramite la tabella di giunzione imbarcazioni_segnalazioni
   * @param mmsi identificatore unico dell'imbarcazione
   * @returns array di oggetti Segnalazione associati all'imbarcazione
   */
  public async getAllByMmsi(mmsi: number): Promise<Segnalazione[]> {
    const db = DatabaseConnection.getInstance();
    const links = await db.model('imbarcazioni_segnalazioni').findAll({ where: { mmsi } });
    const ids: number[] = [];
    for (const l of links) {
      ids.push(l.get('id_segnalazione') as number);
    }
    return await Segnalazione.findAll({ where: { id: ids } });
  }
}