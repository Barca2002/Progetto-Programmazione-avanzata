import { Datiinviati, DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { Transaction } from 'sequelize';
import { InterfacciaDAO } from './InterfacciaDAO.js';

export class DatiinviatiDAO implements InterfacciaDAO<Datiinviati> {

  /**
   * Funzione che crea un nuovo dato inviato nel database, attraverso una transazione, che nel caso di errore esegue un rollback e non permette la creazione
   * @param data oggetto che contiene i dati necessari per la creazione di un dato inviato
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto Datiinviati
   */
  public async create(data: DatiinviatiCreationData, t: Transaction): Promise<Datiinviati> {
    return await Datiinviati.create(data, { transaction: t });
  }

  /**
   * Funzione che restituisce un dato inviato tramite il suo id, oppure null se non esiste
   * @param user_id identificatore univoco del dato inviato
   * @returns oggetto Datiinviati trovato, oppure null se non esiste
   */
  public async get(user_id: number): Promise<Datiinviati | null> {
    return await Datiinviati.findByPk(user_id);
  }

  /**
   * Funzione che restituisce tutti i dati inviati presenti nel database
   * @returns array di oggetti Datiinviati
   */
  public async getAll(): Promise<Datiinviati[]> {
    return await Datiinviati.findAll();
  }

  /**
   * Funzione che aggiorna un dato inviato tramite il suo id, attraverso una transazione opzionale
   * @param dato_id identificatore univoco del dato inviato da aggiornare
   * @param new_data oggetto con i campi da aggiornare (parziale rispetto a tutti i campi del dato inviato)
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva, opzionale
   * @returns oggetto Datiinviati aggiornato
   */
  public async update(dato_id: number, new_data: Partial<DatiinviatiCreationData>, t?: Transaction): Promise<Datiinviati | null> {
    const dato_inviato = await Datiinviati.findByPk(dato_id);
    return await dato_inviato!.update(new_data, { transaction: t! });
  }

  /**
   * Funzione che restituisce l'ultimo dato inviato da una specifica imbarcazione, in ordine di data di creazione decrescente
   * @param mmsi identificatore unico dell'imbarcazione
   * @returns oggetto Datiinviati più recente, oppure null se non esiste alcun dato per quell'imbarcazione
   */
  public async getLastDatoByMmsi(mmsi: number): Promise<Datiinviati | null> {
    return await Datiinviati.findOne({
      where: { mmsi },
      order: [['created_at', 'DESC']],
    });
  }
}