import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import { GeoAreaLinkData, PointsAsGeoJsonData } from "./AdminController.js";
import { ImbarcazioneCreationData } from "../models/ImbarcazioneModel.js";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

export class ImbarcazioneController {
  public readonly imbarcazioneService = new ImbarcazioneService();
  public readonly geofenceareaService = new GeofenceareaService();

  // Funzione che ritorna all'adminController tutte le imbarcazioni che sono in una geoarea.
  public async getAllImbarcazioniWithGeofenceareas(){
    return await this.imbarcazioneService.getAllImbarcazioniWithGeofenceareas();
  }

  // Funzione che ritorna all'utente tutte le proprie imbarcazioni che sono in una geoarea.
  public async getUserImbarcazioniWithGeofenceareas(user_id: number) {
      const imbarcazioni = await this.imbarcazioneService.getUserImbarcazioniWithGeofenceareas(user_id);
      return imbarcazioni;
  }

  // Si possono linkare più imbarcazioni a più geoaree in una sola richiesta.
  public async linkGeoareasToImbarcazioni(links: GeoAreaLinkData[]): Promise<void> {
      return await this.imbarcazioneService.linkGeoareasToImbarcazioni(links);
  }

  public async unlinkGeoareaToImbarcazioni(mmsi: number, geoarea_id: number): Promise<void> {
      return await this.imbarcazioneService.unlinkGeoareaImbarcazione(mmsi, geoarea_id);
  }

  // Funzione chiamata dall'adminController per ottenere tutte le imbarcazioni con le relative segnalazioni.
  public async getAllImbarcazioniWithSegnalazioni() {
      const imbarcazioni_segnalazioni = await this.imbarcazioneService.getAllImbarcazioniWithSegnalazioni();
      return imbarcazioni_segnalazioni;
  }

   // Funzione chiamata dall'userController per ottenere tutte le proprie imbarcazioni con le relative segnalazioni.
  public async getUserImbarcazioniWithSegnalazioni(user_id: number) {
    const my_imbarcazioni_segnalazioni = await this.imbarcazioneService.getUserImbarcazioniWithSegnalazioni(user_id);
    return my_imbarcazioni_segnalazioni;
  }

  // Funzione chiamata dall'adminController per ottenere tutte le posizioni in formato GeoJson di un'imbarcazione.
  public async getPointsAsGeoJson(data: PointsAsGeoJsonData): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
     return await this.imbarcazioneService.getPosizioniImbarcazioneAsGeoJson(data.mmsi, data.start_date, data.end_date);
  }

  public async createImbarcazione(data: ImbarcazioneCreationData) {
      return await this.imbarcazioneService.createImbarcazione(data);
  }

}