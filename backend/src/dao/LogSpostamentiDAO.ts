import { Transaction } from 'sequelize';
import { LogSpostamenti, LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';

export class LogSpostamentiDAO implements InterfacciaDAO<LogSpostamenti> {

  /**
   * Funzione che crea un nuovo log di spostamento nel database, attraverso una transazione, che nel caso di errore esegue un rollback e non permette la creazione
   * @param data oggetto che contiene i dati necessari per la creazione di un log di spostamento
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto LogSpostamenti
   */
  public async create(data: LogSpostamentiCreationData, t: Transaction): Promise<LogSpostamenti> {
    return await LogSpostamenti.create(data, { transaction: t });
  }

  /**
   * Funzione che restituisce un log di spostamento tramite il suo id, oppure null se non esiste
   * @param log_id identificatore univoco del log di spostamento
   * @returns oggetto LogSpostamenti trovato, oppure null se non esiste
   */
  public async get(log_id: number): Promise<LogSpostamenti | null> {
    return await LogSpostamenti.findByPk(log_id);
  }

  /**
   * Funzione che restituisce tutti i log di spostamento presenti
   * @returns array di oggetti LogSpostamenti
   */
  public async getAll(): Promise<LogSpostamenti[]> {
    return await LogSpostamenti.findAll();
  }

  /**
   * Funzione che aggiorna i dati di un log di spostamento tramite il suo id, attraverso una transazione
   * @param log_id identificatore univoco del log di spostamento da aggiornare
   * @param new_data oggetto con i campi da aggiornare (parziale rispetto a tutti i campi del log di spostamento)
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto LogSpostamenti
   */
  public async update(log_id: number, new_data: Partial<LogSpostamentiCreationData>, t: Transaction): Promise<LogSpostamenti | null> {
    const log_spostamento = await LogSpostamenti.findByPk(log_id);
    return await log_spostamento!.update(new_data, { transaction: t });
  }

  /**
 * Restituisce l'ultimo spostamento effettuato da un imbarcazione in una geofence area.
 * @param mmsi numero che rappresenta l'id dell'imbarcazione.
 * @param geoarea_id numero che rappresenta l'id della geofence area.
 * @returns oggetto Logspostamenti o null.
 */
  public async getLastByMmsiAndGeoarea(mmsi: number, geoarea_id: number): Promise<LogSpostamenti | null> {
    return await LogSpostamenti.findOne({ where: { mmsi: mmsi, geoarea_id: geoarea_id }, order: [['created_at', 'DESC']] });
  }
}
