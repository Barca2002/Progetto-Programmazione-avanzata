import { GeofenceareaService } from "../services/GeofenceareaService.js";
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";

export class GeofenceAreaController {
  public readonly geofenceareaService = new GeofenceareaService();

  public async createArea(data: GeofenceareaCreationData ){
      return await this.geofenceareaService.createArea(data);
  }

}