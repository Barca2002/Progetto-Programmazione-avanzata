import { GeofenceareaService } from "../services/GeofenceareaService.js";
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";

export class GeofenceAreaController {
  public readonly geofenceareaService = new GeofenceareaService();

  /**
   * Funzione che crea una nuova geofence area
   * @param data oggetto che contiene i dati per la creazione di una geofence area (nome, poligono, velocità massima)
   * @returns oggetto Geofencearea
   */
  public async createArea(data: GeofenceareaCreationData) {
    return await this.geofenceareaService.createArea(data);
  }

}