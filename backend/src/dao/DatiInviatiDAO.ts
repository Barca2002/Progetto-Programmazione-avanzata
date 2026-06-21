import { Datiinviati } from '../models/DatiInviatiModel.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

interface IDatiinviatiDAO {
  create(data: DatiinviatiCreationData): Promise<Datiinviati>;
  findByMmsi(mmsi: number): Promise<Datiinviati[]>;
}

export class DatiinviatiDAO implements IDatiinviatiDAO {

  async create(data: DatiinviatiCreationData): Promise<Datiinviati> {
    try {
      return await Datiinviati.create({
        mmsi: data.mmsi,
        latitudine: data.latitudine,
        longitudine: data.longitudine,
        velocita_kmh: data.velocita_kmh,
        stato: data.stato,
        timestamp: Date.now() //linux epoch
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }

  async findByMmsi(mmsi: number): Promise<Datiinviati[]> {
    try {
      return await Datiinviati.findAll({ where: { mmsi: mmsi } });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}

export default DatiinviatiDAO;