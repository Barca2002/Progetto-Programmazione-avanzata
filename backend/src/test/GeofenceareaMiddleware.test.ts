import { Request } from "express";
import { checkGeoJsonFormat } from "../../src/middlewares/GeofenceareaMiddleware.js";
import { AppError } from "../../src/models/AppErrorModel.js";

const mockReq = (body: object) =>
  ({ body } as unknown as Request);
const res = {} as any;
const next = jest.fn();
const getError = () => next.mock.calls[0][0] as AppError;

// Siccome il body viene modificato, meglio metterlo in una funzione, cos' ad ogni chiamata viene creata una nuova copia, senza creare problemi per i vari test.
const validBody = () => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Area test", max_speed: 50 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [12.1, 41.1],
            [12.2, 41.1],
            [12.2, 41.2],
            [12.1, 41.1],
          ],
        ],
      },
    },
  ],
});

// --------------------------------------------------
// checkGeoJsonFormat
// --------------------------------------------------

describe("checkGeoJsonFormat", () => {
  beforeEach(() => jest.resetAllMocks());

  test("valid GeoJSON -> next() senza errori", () => {
    checkGeoJsonFormat(
      mockReq(validBody()),
      res, 
      next);
    expect(next).toHaveBeenCalledWith();
  });

  test("type non valido -> INVALID_TYPE_FEATURECOLLECTION", () => {
    const body = validBody();
    body.type = "Feature";

    checkGeoJsonFormat(
      mockReq(body),
      res,
      next);

    expect(getError().statusName).toBe(
      "INVALID_TYPE_FEATURECOLLECTION"
    );
  });

  test("longitudine fuori range -> INVALID_LONGITUDINE_RANGE", () => {
    const body = validBody();
    body.features[0]!.geometry.coordinates[0]![0] = [181, 41.1];

    checkGeoJsonFormat(
      mockReq(body),
      res,
      next);

    expect(getError().statusName).toBe("INVALID_LONGITUDINE_RANGE");
  });
});