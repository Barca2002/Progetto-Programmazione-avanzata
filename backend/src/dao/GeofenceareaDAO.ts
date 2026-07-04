import { Transaction } from 'sequelize';
import { Geofencearea, GeofenceareaCreationData } from '../models/GeofenceareaModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';

export class GeofenceareaDAO implements InterfacciaDAO<Geofencearea> {
  /**
   * Funzione che crea una nuova geofence area nel database, attraverso una transazione, che nel caso di errore esegue un rollback e non permette la creazione
   * @param data oggetto che contiene i dati necessari per la creazione di una geofencearea
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto Geofencearea
   */
  public async create(data: GeofenceareaCreationData, t: Transaction): Promise<Geofencearea> {
    return await Geofencearea.create(data, { transaction: t });
  }

  /**
   * Funzione che ritorna una geofence area con l'id passato come parametro nella funzione o null in caso non venga trovata una geofence area
   * @param geoarea_id 
   * @returns oggetto Geofencearea o null
   */
  public async get(geoarea_id: number): Promise<Geofencearea | null> {
    return await Geofencearea.findByPk(geoarea_id);
  }

  public async getAll(): Promise<Geofencearea[]> {
    return await Geofencearea.findAll();
  }

  /**
   * Funzione che restituisce una geofence area cercandola per nome, oppure null se non ne esiste una con quel nome
   * @param name stringa con il nome dell'area che si vuole trovare
   * @returns oggetto Geofencearea trovato, oppure null se non esiste
   */
  public async findByName(name: string): Promise<Geofencearea | null> {
    return await Geofencearea.findOne({ where: { name } });
  }

  public async update(geoarea_id: number, new_data: Partial<GeofenceareaCreationData>, t: Transaction): Promise<Geofencearea | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    return await geoarea!.update(new_data, { transaction: t });
  }
}
