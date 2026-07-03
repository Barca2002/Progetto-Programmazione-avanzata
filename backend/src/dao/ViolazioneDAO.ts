import { Op, Transaction } from 'sequelize';
import { Violazione, ViolazioneCreationData } from '../models/ViolazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';

export class ViolazioneDAO implements InterfacciaDAO<Violazione> {

  async create(data: ViolazioneCreationData, t: Transaction): Promise<Violazione> {
    return await Violazione.create(data, {transaction: t});
  }

  async get(violazione_id: number, _item_id2?: number): Promise<Violazione | null> {
    return await Violazione.findByPk(violazione_id);
  }

  async getAll(): Promise<Violazione[]> {
    return await Violazione.findAll();
  }

  async getUltimaViolazioneValida(geoarea_id: number): Promise<Violazione | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    return await Violazione.findOne({ where: { id: geoarea?.ultima_violazione_valida_id } })
  }

  async getAllByMmsi(mmsi: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { mmsi } });
  }

  // Ritorna al massimo le violazioni vecchia al massimo 2 giorni dall'ultima violazione valida della geoarea.
  async getRecentByGeoarea(geoarea_id: number): Promise<Violazione[] | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    const ultimaViolazioneValida = await Violazione.findOne({where: {id:geoarea!.ultima_violazione_valida_id}});

    // Dopo aver preso la geoarea e l'ultima violazione valida associata, predo tutte le violazioni che partono da 2 giorni indietro l'ultima violazione valida in poi, quindi anche quelle nuove.
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

  async getAllByGeoarea(geoarea_id: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { geoarea_id }, order: [["created_at", "DESC"]] });
  }


  async update(violazione_id: number, new_data:Partial<ViolazioneCreationData>, t: Transaction): Promise<Violazione> {
    const violazione = await Violazione.findByPk(violazione_id);
    return await violazione!.update(new_data, {transaction: t});
  }

  async delete(user_id: number, t: Transaction): Promise<Violazione | null> {
      const violazione = await Violazione.findByPk(user_id);
      await violazione!.destroy({ transaction: t });
      return violazione;
  }
}