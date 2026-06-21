import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';
import { AppError } from '../models/AppErrorModel.js';

interface IImbarcazioneDAO {
  create(data: ImbarcazioneCreationData): Promise<Imbarcazione>;
  findById(mmsi: number): Promise<Imbarcazione | null>;
  findAll(): Promise<Imbarcazione[]>;
  update(mmsi: number, data: Partial<ImbarcazioneCreationData>): Promise<number>;
  delete(mmsi: number): Promise<number>;
  findAllGeofences(): Promise<Imbarcazione[]>;
  findAllByUserWithGeofences(user_id: number): Promise<Imbarcazione[]>;
}

export class ImbarcazioneDAO implements IImbarcazioneDAO {
  async create(data: ImbarcazioneCreationData): Promise<Imbarcazione> {
    try {
      let imbarcazione = await Imbarcazione.create(data);
      return imbarcazione;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }

  async findById(mmsi: number): Promise<Imbarcazione | null> {
    try {
      return await Imbarcazione.findByPk(mmsi);
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  // IMBARCAZIONI CON GEOFENCEAREAS ASSOCIATE (X ROTTA ADMIN)
  async findAllGeofences(): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll({
        include: [{
          model: Geofencearea,
          as: 'Geofenceareas',
          attributes: ['geoarea_id', 'name'], //quali colonne restituire di geofence areas
          through: { attributes: [] } //esclude attributi della molti a molti fra i due models (mmsi e geoarea_id)
        }]
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  // IMBARCAZIONI DELL'UTENTE LOGGATO CON GEOFENCEAREAS ASSOCIATE
  async findAllByUserWithGeofences(user_id: number): Promise<Imbarcazione[]> {
    try {
        return await Imbarcazione.findAll({
            include: [
                {
                    model: User,
                    where: { user_id }, //voglio le imbarcazioni con le geofence areas associate allo user_id loggato
                    attributes: [],
                    through: { attributes: [] }
                },
                {
                    model: Geofencearea,
                    as: 'Geofenceareas',
                    attributes: ['geoarea_id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
    } catch (err) {
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  // ASSOCIA PIU GEOAREAS A PIU IMBARCAZIONI E UN IMBARCAZIONE AD UN UTENTE
  async addGeoareasEUserToImbarcazioni(links: { mmsi: number, geoarea_ids: number[], user_id: number }[]): Promise<void> {
    const sequelize = Imbarcazione.sequelize!;
    const t = await sequelize.transaction(); // apro la transazione, da qui in poi tutto resta "in sospeso" finché non chiamo commit o rollback

    try {
      /*
      sequelize: ogni model Sequelize ha una proprietà statica sequelize che punta all'istanza di connessione al database 
      
      models: è un dizionario (oggetto chiave-valore) che contiene tutti i model registrati su quella connessione, sia quelli che espliciti, sia quelli creati automaticamente da Sequelize per le tabelle ponte (come geofence_imbarcazioni, grazie all'opzione: through: 'geofence_imbarcazioni')
      
      geofence_imbarcazioni: prendo il model che rappresenta quella tabella ponte.

      --> è il modello che rappresenta l'intera tabella geofence_imbarcazioni
      */
       
      const GeofenceImbarcazioni = sequelize.models.geofence_imbarcazioni!;
      const UserImbarcazioni = sequelize.models.user_imbarcazioni!;
      
      for (const { mmsi, geoarea_ids, user_id } of links) {
        //mmsi e ogni geoarea_id devono essere numeri interi, altrimenti ricontrolla il formato dei dati inseriti
        const valoriValidi =
          typeof mmsi === 'number' && Number.isInteger(mmsi) &&
          Array.isArray(geoarea_ids) &&
          geoarea_ids.every(id => typeof id === 'number' && Number.isInteger(id));

        if (!valoriValidi) {
          throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        }

        //Controllo che l'imbarcazione esista
        const imbarcazione = await Imbarcazione.findByPk(mmsi, { transaction: t });
        if (!imbarcazione)
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

        //Controllo che lo user esista
        const user = await User.findByPk(user_id, { transaction: t });
        if (!user)
          throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);

        //Controllo che tutte le geoareas esistano
        for (const geoarea_id of geoarea_ids) {
          const geoarea = await Geofencearea.findByPk(geoarea_id, { transaction: t });
          if (!geoarea)
            throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        }
       

        /*
        mmsi fissato, per ogni geoarea_id creo la coppia { mmsi, geoarea_id }, che è la riga che bulkCreate inserirà nel db
        
        bulkCreate è utile quando devo fare più insert di fila come nel nostro caso, invece di lanciare piu .create (più insert separati) per ogni geoarea_ids, ne lancio una con una map

        */
        await GeofenceImbarcazioni.bulkCreate(
          geoarea_ids.map(geoarea_id => ({ mmsi: mmsi, geoarea_id: geoarea_id })), // itera sull'array geoarea_ids e ad ogni iterazione geoarea_id è l'elemento corrente
          { ignoreDuplicates: true, transaction: t } // non duplica associazioni già esistenti ed esegue le query all'interno della transazione t, non direttamente sul database, cosi se ho un errore nel body, devo rifare la richiesta completamente giusta. Senza questa strategia le query con input giusto venivano eseguite e non si sapeva quali avesse fatto; adesso al primo errore bisogna rimandare la richiesta da capo ben formata.
        );

        //console.log(geoarea_ids.map(geoarea_id => ({ mmsi: mmsi, geoarea_id: geoarea_id })))

        //Controllo se l'imbarcazione è gia associata ad un utente, nel caso lo segnalo. Non metto user_id perche mi basta sapere che gia è associata, quindi c'è una riga nella tabella (CHIEDERE AL PROF)
        const associazioneEsistente = await UserImbarcazioni.findOne({
          where: { mmsi: mmsi },
          transaction: t
        });

        if (associazioneEsistente) {
          throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_ALREADY_ASSOCIATED);
        }

        await UserImbarcazioni.create({ user_id: user_id, mmsi: mmsi }, { ignoreDuplicates: true, transaction: t }) //adesso associo un imbarcazione ad un utente, controllando sempre che non ci siano errori nel body della request
      }
      
      await t.commit(); // tutti i link erano validi: rendo definitive le insert fatte finora

    } catch (err) {
        await t.rollback(); // anche con un solo link non valido: annullo TUTTE le insert fatte finora in questa chiamata
        if (err instanceof AppError) {
          throw err;
        }
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async deleteGeoarea(links: { mmsi: number, geoarea_id: number }): Promise<void> {
    const { mmsi, geoarea_id } = links;
    const sequelize = Imbarcazione.sequelize!;
    const t = await sequelize.transaction(); // apro la transazione, da qui in poi tutto resta "in sospeso" finché non chiamo commit o rollback
    try {
      const GeofenceImbarcazioni = sequelize.models.geofence_imbarcazioni!;

      const valoriValidi =
          typeof mmsi === 'number' && Number.isInteger(mmsi) &&
          typeof geoarea_id === 'number' && Number.isInteger(geoarea_id);

      if (!valoriValidi) {
          throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      //Controllo che la coppia mmsi, geoarea_id esiste prima, nel caso lo segnalo
      const associazione = await GeofenceImbarcazioni.findOne({
        where: { mmsi: mmsi, geoarea_id: geoarea_id },
        transaction: t
      });

      if (!associazione) {
        throw ErrorFactory.getError(AppErrorEnum.ASSOCIAZIONE_NOT_FOUND);
      }
      
      await GeofenceImbarcazioni.destroy({ where: { mmsi: mmsi, geoarea_id: geoarea_id }, transaction: t}); //adesso dissocio un imbarcazione ad una geoarea, controllando sempre che non ci siano errori nel body della request
      await t.commit()
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) {
        throw err;
      }
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }


  async findAll(): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll();
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async update(mmsi: number, data: Partial<ImbarcazioneCreationData>): Promise<number> {
    try {
      const [affectedCount] = await Imbarcazione.update(data, { where: { mmsi } });
      return affectedCount;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(mmsi: number): Promise<number> {
    try {
      return await Imbarcazione.destroy({ where: { mmsi } });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}

export default ImbarcazioneDAO;