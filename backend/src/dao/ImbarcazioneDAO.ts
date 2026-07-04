import { Op, Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';
import { Datiinviati } from '../models/DatiInviatiModel.js';

export class ImbarcazioneDAO implements InterfacciaDAO<Imbarcazione> {

 /**
 * Crea una nuova imbarcazione nel database attraverso una transazione, che nel caso di errore esegue un rollback e non permette la creazione
 * @param data oggetto che contiene i dati necessari per la creazione di un imbarcazione
 * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
 * @returns oggetto Imbarcazione
 */
public async create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione> {
  return await Imbarcazione.create(data, { transaction: t });
}

  /**
   * Funzione che torna l'imbarcazione con l'mmsi dato come parametro oppure null in caso di imbarcazione non trovata
   * @param mmsi identificatore univoco dell'imbarcazione
   * @returns  oggetto imbarcazione o null
   */
  public async get(mmsi: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findByPk(mmsi);
  }

  /**
   * Funzione che ritorna tutte le imbarcazioni
   * @returns vettore di imbarcazioni
   */
  public async getAll(): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll();
  }

  public async getByUserId(user_id: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findOne({
      where: { user_id: user_id }
    });
  }

  /**
   * Funzione che ritorna un'imbarcazione se ne esiste una con il nome passato come parametro o null in caso di imbarcazione non trovata
   * @param name stringa del nome dell'imbarcazione
   * @returns oggetto imbarcazione o null
   */
  public async getByName(name: string): Promise<Imbarcazione | null> {
    return await Imbarcazione.findOne({
      where: { name: name }
    });
  }

  /**
   * Restituisce tutte le imbarcazioni in base all'id utente.
   * @param user_id numero che rappresenta l'id dell'utente.
   * @returns lista d'imbarcazioni.
   */
  public async getAllByUserId(user_id: number): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      where: { user_id: user_id }
    });
  }

  /**
   * Funzione che torna tutti i dati inviati dall'imbarcazione in un range di date 
   * @param mmsi identificatore unico dell'imbarcazione
   * @param start_date data di inizio ricerca
   * @param end_date data di fine ricerca 
   * @returns vettore di oggetti di tipo Datiinviati
   */
  public async getPositionsByMmsiAndDateRange(mmsi: number, start_date: Date, end_date: Date): Promise<Datiinviati[]> {
    return await Datiinviati.findAll({
      where: {
        mmsi,
        created_at: { [Op.between]: [start_date.getTime(), end_date.getTime()] }
      }
    });
  }

  public async update(mmsi: number, new_data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione | null> {
    const imbarcazione = await Imbarcazione.findByPk(mmsi);
    return await imbarcazione!.update(new_data, { transaction: t });
  }
}