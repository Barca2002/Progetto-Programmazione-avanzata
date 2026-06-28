import { Datiinviati, DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { Transaction } from 'sequelize';
import { InterfacciaDAO } from './InterfacciaDAO.js';

/*
export interface InterfacciaDAO<T>{
    create(item: T, t: Transaction): Promise<T>;
    get(id: number): Promise<T | null>;
    getAll(): Promise<T[]>; 
    update(item_id: number, item_id2?: number, new_data?: Partial<T>, t?: Transaction): Promise<T | null>;
    delete(item_id1: number, item_id2?: number, t?: Transaction): Promise<T | null>;
}
*/


export class DatiinviatiDAO implements InterfacciaDAO<Datiinviati> {

  async create(data: DatiinviatiCreationData, t: Transaction): Promise<Datiinviati> {
    return await Datiinviati.create(data, {transaction: t});
  }

  async findAllByMmsi(mmsi: number): Promise<Datiinviati[]> {
    return await Datiinviati.findAll({ where: { mmsi: mmsi } });
  }

  async get(user_id: number, _item_id2?: number): Promise<Datiinviati | null> {
    return await Datiinviati.findByPk(user_id);
  }
  
  async getAll(): Promise<Datiinviati[]> {
    return await Datiinviati.findAll();
  }

  async update(dato_id: number, _item_id2?: number, new_data?:Partial<DatiinviatiCreationData>, t?: Transaction): Promise<Datiinviati | null> {
      const dato_inviato = await Datiinviati.findByPk(dato_id);
      return await dato_inviato!.update(new_data!, {transaction: t!});
  }
  
  async delete(dato_id: number,  _item_id2?: number, t?: Transaction): Promise<Datiinviati | null> {
    const dato_inviato = await Datiinviati.findByPk(dato_id);
    await dato_inviato!.destroy({ transaction: t! });
    return dato_inviato;
  }

}

 // Estrae la geofence area di un'imbarcazione in base alla sua posizione
  // async getGeoareaByPosition(mmsi: number, longitudine: number, latitudine: number): Promise<Geofencearea | null> {
  //     const db = DatabaseConnection.getInstance();
  //     const results = await db.query(`SELECT ga.* FROM geofence_areas ga WHERE ST_Within(ST_SetSRID(ST_MakePoint(:longitudine, :latitudine), 4326), ga.area)`, 
  //     {
  //       // Mappiamo il risultato al model Geofencearea, così otteniamo l'oggetto come risultato. Replacement sostituisce i parametri con i valori associati.
  //         replacements: { mmsi: mmsi, latitudine: latitudine, longitudine: longitudine },
  //         type: QueryTypes.SELECT,
  //         model: Geofencearea,
  //         mapToModel: true
  //     });
  //     // Per estrarre un solo oggetto, vediamo la lunghezza del risultato della query.
  //     // Se è > 0, prendiamo la prima geofencearea (può estrarre al massimo una sola geofencearea), altrimenti restituiamo null.
  //     return results.length > 0 ? results[0]! : null;
  // }

  // async findLastDatoInviato(mmsi: number): Promise<Datiinviati | null> {
  //     return await Datiinviati.findOne({
  //         where: { mmsi: mmsi },
  //         order: [['created_at', 'DESC']], // Ordina dal più recente al più vecchio
  //     });
  // }
