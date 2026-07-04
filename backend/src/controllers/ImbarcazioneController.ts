import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import { GetPointsAsGeoJsonBody, ImbarcazioneCreationData, LinkDataBody, UnlinkDataBody } from "../models/ImbarcazioneModel.js";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

export class ImbarcazioneController {
  public readonly imbarcazioneService = new ImbarcazioneService();
  public readonly geofenceareaService = new GeofenceareaService();

  // Funzione che ritorna all'adminController tutte le imbarcazioni che sono in una geoarea.
  public async getAllImbarcazioniWithGeofenceareas(){
    return await this.imbarcazioneService.getAllImbarcazioniWithGeofenceareas();
  }

  /**
   * Funzione che, tramite l'id dell'utente, restituisce tutte le sue imbarcazioni con le relative geofence aree autorizzate. 
   * @param user_id numero che rappresenta l'id dell'utente.
   * @returns lista di imbarcazioni con le relative geofence aree autorizzate in formato JSON.
   */
  public async getUserImbarcazioniWithGeofenceareas(user_id: number) {
      const imbarcazioniWithGeoaree = await this.imbarcazioneService.getUserImbarcazioniWithGeofenceareas(user_id);
      return imbarcazioniWithGeoaree;
  }

  // Si possono linkare più imbarcazioni a più geoaree in una sola richiesta.
  public async linkGeoareasToImbarcazioni(links: LinkDataBody[]): Promise<void> {
      return await this.imbarcazioneService.linkGeoareasToImbarcazioni(links);
  }

  public async unlinkGeoareaToImbarcazioni(unlink: UnlinkDataBody){
      return await this.imbarcazioneService.unlinkGeoareaImbarcazione(unlink);
  }

  // Funzione chiamata dall'adminController per ottenere tutte le imbarcazioni con le relative segnalazioni.
  public async getAllImbarcazioniWithSegnalazioni() {
      const imbarcazioni_segnalazioni = await this.imbarcazioneService.getAllImbarcazioniWithSegnalazioni();
      return imbarcazioni_segnalazioni;
  }

   /**
    * Funzione che restituisce tutte le imbarcazioni e le relative segnalazioni tramite id utente.
    * @param user_id numero che rappresenta l'id dell'utente.
    * @returns lista di imbarcazione con le relative segnalazioni in formato JSON.
    */
  public async getUserImbarcazioniWithSegnalazioni(user_id: number) {
    const my_imbarcazioni_segnalazioni = await this.imbarcazioneService.getUserImbarcazioniWithSegnalazioni(user_id);
    return my_imbarcazioni_segnalazioni;
  }

  // Funzione chiamata dall'adminController per ottenere tutte le posizioni in formato GeoJson di un'imbarcazione.
  public async getPointsAsGeoJson(data: GetPointsAsGeoJsonBody): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
    const end_date = data.end_date ?? new Date().toLocaleDateString('it-IT');
    return await this.imbarcazioneService.getPosizioniImbarcazioneAsGeoJson(data.mmsi, data.start_date, end_date);
  }

  /**
   * Funzione che ritorna l'imbarcazione creata 
   * @param data: contiene i dati necessari per la creazione dell'imbarcazione
   * @returns: oggetto imbarcazione
   */
  public async createImbarcazione(data: ImbarcazioneCreationData) {
      return await this.imbarcazioneService.createImbarcazione(data);
  }

}