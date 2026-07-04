import { Transaction } from 'sequelize';
import { Segnalazione, SegnalazioneCreationData } from '../models/SegnalazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';


export class SegnalazioneDAO implements InterfacciaDAO<Segnalazione> {

  public async create(data: SegnalazioneCreationData, t: Transaction): Promise<Segnalazione> {
    return await Segnalazione.create(data, { transaction: t });
  }

  public async get(segnalazione_id: number): Promise<Segnalazione | null> {
    return await Segnalazione.findByPk(segnalazione_id);
  }

  public async getAll(): Promise<Segnalazione[]> {
    return await Segnalazione.findAll();
  }

  public async findAllByGeoarea(geoarea_id: number): Promise<Segnalazione[] | null> {
    return await Segnalazione.findAll({ where: { geoarea_id }, order: [["created_at", "DESC"]] });
  }

  public async findLastInCorsoByGeoarea(geoarea_id: number): Promise<Segnalazione | null> {
    return await Segnalazione.findOne({ where: { geoarea_id, stato: 'IN CORSO' }, order: [["created_at", "DESC"]] });
  }

  public async findAll(): Promise<Segnalazione[]> {
    return await Segnalazione.findAll();
  }


  public async findAllByMmsi(mmsi: number): Promise<Segnalazione[]> {
    const db = DatabaseConnection.getInstance();
    //Si sfrutta il fatto che a runtime sequelize crea un model per la tabella imbarcazioni_segnalazioni. Da links si trovano tutte le imbarcazioni con segnalazioni
    const links = await db.model('imbarcazioni_segnalazioni').findAll({ where: { mmsi } });
    const ids: number[] = [];
    for (const l of links) {
      //Popolo ids mettendoci tutti gli id_segnalazione trovati in links, ovvero tutti gli id_segnalazione delle imbarcazioni con segnalazioni
      ids.push(l.get('id_segnalazione') as number);
    }
    return await Segnalazione.findAll({ where: { id: ids } });
  }

  public async update(segnalazione_id: number, new_data: Partial<SegnalazioneCreationData>, t: Transaction): Promise<Segnalazione | null> {
    const segnalazione = await Segnalazione.findByPk(segnalazione_id);
    return await segnalazione!.update(new_data, { transaction: t });
  }

  public async delete(segnalazione_id: number, t: Transaction): Promise<Segnalazione | null> {
    const segnalazione = await Segnalazione.findByPk(segnalazione_id);
    await segnalazione!.destroy({ transaction: t });
    return segnalazione;
  }
}