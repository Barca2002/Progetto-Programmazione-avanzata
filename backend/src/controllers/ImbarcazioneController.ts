import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import { GetPositionsInDateRange, ImbarcazioneCreationData, LinkDataBody, UnlinkDataBody } from "../models/ImbarcazioneModel.js";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

export class ImbarcazioneController {
  public readonly imbarcazioneService = new ImbarcazioneService();
  public readonly geofenceareaService = new GeofenceareaService();

  /**
   * Funzione che torna tutte le imbarcazioni con le proprie geofence aree associate
   * @returns lista di imbarcazioni con le proprie geofence aree associate
   */
  public async getAllImbarcazioniWithGeofenceareas() {
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

  /**
   * Funzione che associa delle imbarcazioni a delle geoaree
   * @param links vettore che contiene i link fra le imbarcazioni e le geofence aree
   * @returns void
   */
  public async linkGeoareasToImbarcazioni(links: LinkDataBody[]): Promise<void> {
    return await this.imbarcazioneService.linkGeoareasToImbarcazioni(links);
  }

  /**
   * Funzione che dissocia una geofence area da un'imbarcazione
   * @param unlink oggetto che contiene i dati per dissociare una geofence area da un'imbarcazione
   * @returns void
   */
  public async unlinkGeoareaToImbarcazioni(unlink: UnlinkDataBody) {
    return await this.imbarcazioneService.unlinkGeoareaImbarcazione(unlink);
  }

  /**
   * Funzione che torna un vettore di imbarcazioni con le segnalazioni associate
   * @returns imbarcazioni con segnalazioni
   */
  public async getAllImbarcazioniWithSegnalazioni() {
    return await this.imbarcazioneService.getAllImbarcazioniWithSegnalazioni();
  }

  /**
   * Funzione che restituisce tutte le imbarcazioni e le relative segnalazioni tramite id utente.
   * @param user_id numero che rappresenta l'id dell'utente.
   * @returns lista di imbarcazione con le relative segnalazioni in formato JSON.
   */
  public async getUserImbarcazioniWithSegnalazioni(user_id: number) {
    return await this.imbarcazioneService.getUserImbarcazioniWithSegnalazioni(user_id);
  }

  /**
   * Funzione che recupera le posizioni registrate di un'imbarcazione in un determinato intervallo di date e le restituisce in formato GeoJSON
   * @param data oggetto contenente mmsi dell'imbarcazione, data di inizio e data di fine dell'intervallo di ricerca
   * @returns oggetto GeoJSON (FeatureCollection) con le posizioni dell'imbarcazione come geometrie
 */
  public async getPointsAsGeoJson(data: GetPositionsInDateRange): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
    return await this.imbarcazioneService.getPosizioniImbarcazioneAsGeoJson(data.mmsi, data.start_date, data.end_date);
  }

  /**
   * Funzione che ritorna l'imbarcazione creata 
   * @param data contiene i dati necessari per la creazione dell'imbarcazione
   * @returns oggetto imbarcazione
   */
  public async createImbarcazione(data: ImbarcazioneCreationData) {
    return await this.imbarcazioneService.createImbarcazione(data);
  }
}