import { LogSpostamenti } from '../models/LogSpostamentiModel.js';
import { Imbarcazione } from '../models/ImbarcazioneModel.js';

interface ILogSpostamentiDAO {
  findAllConImbarcazioni(): Promise<Imbarcazione[]>;
}

export class LogSpostamentiDAO implements ILogSpostamentiDAO {

  async findAllConImbarcazioni(): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
        include: [
        {
            model: LogSpostamenti,
            as: 'LogSpostamenti',
            attributes: ['id', 'spostamento', 'created_at', 'geoarea_id', 'mmsi'],
            required: true
        }
        ]
    });
    }
}