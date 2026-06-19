import { Imbarcazione } from '../models/ImbarcazioneModel.js';
import { ImbarcazioneAllData } from '../models/ImbarcazioneModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

interface IImbarcazioneDAO {
  create(data: ImbarcazioneAllData): Promise<Imbarcazione>;
  findById(mmsi: number): Promise<Imbarcazione | null>;
  findAll(): Promise<Imbarcazione[]>;
  update(mmsi: number, data: Partial<ImbarcazioneAllData>): Promise<number>;
  delete(mmsi: number): Promise<number>;
}

export class ImbarcazioneDAO implements IImbarcazioneDAO {
  async create(data: ImbarcazioneAllData): Promise<Imbarcazione> {
    try{
      let imbarcazione = await Imbarcazione.create(data);
      return imbarcazione;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }

  }

  async findById(mmsi: number): Promise<Imbarcazione | null> {
    try{
      return await Imbarcazione.findByPk(mmsi);
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findAll(): Promise<Imbarcazione[]> {
    try{
      return await Imbarcazione.findAll();
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async update(mmsi: number, data: Partial<ImbarcazioneAllData>): Promise<number> {
    try{
      const [affectedCount] = await Imbarcazione.update(data, { where: { mmsi } });
      return affectedCount;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(mmsi: number): Promise<number> {
    try{
      return await Imbarcazione.destroy({ where: { mmsi } });
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }

  }
}

export default ImbarcazioneDAO;