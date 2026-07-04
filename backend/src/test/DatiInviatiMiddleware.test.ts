import { Request } from "express";
import { checkDatiInviati } from "../../src/middlewares/DatiInviatiMiddleware.js";
import { AppError } from "../../src/models/AppErrorModel.js";
import { MAX_SPEED_ALLOWED } from "../utils/GlobalConstants.js";

const mockReq = (body: object) =>
  ({ body } as unknown as Request);
const res = {} as any;
const next = jest.fn();
const getError = () => next.mock.calls[0][0] as AppError;

const validBody = {
  mmsi: 123456789,
  latitudine: 41.1234567,
  longitudine: 12.1234567,
  velocita_kmh: 50,
  stato: "IN NAVIGAZIONE",
};

describe("checkDatiInviati", () => {
  beforeEach(() => jest.resetAllMocks());

  test("valid input -> next() senza errori", () => {
    checkDatiInviati(
      mockReq(validBody),
      res,
      next);
    expect(next).toHaveBeenCalledWith();
  });

  test("mmsi mancante -> MISSING_MMSI", () => {
    const bodyIncompleto = { ...validBody }
    delete (bodyIncompleto as any)["mmsi"];
    checkDatiInviati(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_MMSI");
  });

  test("mmsi non valido -> INVALID_MMSI", () => {
    checkDatiInviati(
      mockReq({ ...validBody, mmsi: 12345 }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_MMSI");
  });

  test("latitudine mancante -> MISSING_LATITUDINE", () => {
    const bodyIncompleto = { ...validBody }
    delete (bodyIncompleto as any)["latitudine"];
    checkDatiInviati(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_LATITUDINE");
  });

  test("latitudine fuori range -> INVALID_LATITUDINE", () => {
    checkDatiInviati(
      mockReq({ ...validBody, latitudine: 91 }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_LATITUDINE");
  });

  test("longitudine mancante -> MISSING_LONGITUDINE", () => {
    const bodyIncompleto = { ...validBody }
    delete (bodyIncompleto as any)["longitudine"];
    checkDatiInviati(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_LONGITUDINE");
  });

  test("longitudine fuori range -> INVALID_LONGITUDINE", () => {
    checkDatiInviati(
      mockReq({ ...validBody, longitudine: 181 }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_LONGITUDINE");
  });

  test("velocita mancante -> MISSING_VELOCITA_KMH", () => {
    const bodyIncompleto = { ...validBody }
    delete (bodyIncompleto as any)["velocita_kmh"];
    checkDatiInviati(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_VELOCITA_KMH");
  });

  test("velocita troppo alta -> INVALID_VELOCITA", () => {
    checkDatiInviati(
      mockReq({ ...validBody, velocita_kmh: MAX_SPEED_ALLOWED + 1 }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_VELOCITA");
  });

  test("stato non valido -> MISSING_STATO", () => {
    const bodyIncompleto = { ...validBody }
    delete (bodyIncompleto as any)["stato"];
    checkDatiInviati(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_STATO");
  });

  test("stato non valido -> INVALID_STATO", () => {
    checkDatiInviati(
      mockReq({ ...validBody, stato: "FERMO" }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_STATO");
  });
});