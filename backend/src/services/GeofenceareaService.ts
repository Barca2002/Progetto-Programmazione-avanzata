import { GeofenceareaDAO } from "../dao/GeofenceareaDAO.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { DatabaseConnection } from "../singleton/DBConnection.js";
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";
import { Position } from "geojson";

export class GeofenceareaService {
  public readonly geofenceareaDAO = new GeofenceareaDAO();

  public async getAree() {
    const aree = await this.geofenceareaDAO.findAll();
    if (!aree || aree.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    return aree;
  };

  public async getAreaByCoords(coords: Position[][]) {
    const area = await this.geofenceareaDAO.findByCoords(coords)
    if (!area){
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    }
    return area;
  };

  public async getAreaById(id: number) {
    if (isNaN(id) || id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    const area = await this.geofenceareaDAO.findById(id);
    if (!area){
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    }

    return area;
  };

  public async createArea(data: GeofenceareaCreationData) {
    if(await this.geofenceareaDAO.findByCoords(data.area.coordinates) || await this.geofenceareaDAO.findByName(data.name)){
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_ALREADY_EXISTS)
    }
    // La validazione dei dati già viene eseguito dal middleware.
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
    if (!data || Object.keys(data).length === 0){
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
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