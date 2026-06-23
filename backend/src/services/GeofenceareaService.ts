import { GeofenceareaDAO } from "../dao/GeofenceareaDAO.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { DatabaseConnection } from "../singleton/DBConnection.js";
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";

export class GeofenceareaService {
  private readonly geofenceareaDAO = new GeofenceareaDAO();

  public async getAree (){
    return await this.geofenceareaDAO.findAll();
  };

  public async getAreaById(id: number) {
    if (isNaN(id) || id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    const area = await this.geofenceareaDAO.findById(id);
    if (!area)
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    return area;
  };

  public async createArea(data: GeofenceareaCreationData) {
    if (!data.name || !data.area)
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.geofenceareaDAO.create(data, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  };

  public async updateArea(id: number, data: Partial<GeofenceareaCreationData>) {
    await this.getAreaById(id); // controlla esistenza e validità id
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      await this.geofenceareaDAO.update(id, data, t);
      await t.commit();
      return await this.geofenceareaDAO.findById(id);
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  };

  public async deleteArea(id: number) {
    await this.getAreaById(id); // controlla esistenza e validità id
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.geofenceareaDAO.delete(id, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  };
}