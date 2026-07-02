import { Request } from "express";
import { checkDatiInviati } from "../../src/middlewares/DatiInviatiMiddleware.js";
import { AppError } from "../../src/models/AppErrorModel.js";

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

// --------------------------------------------------
// checkDatiInviati
// --------------------------------------------------

describe("checkDatiInviati", () => {
  afterEach(() => jest.clearAllMocks());

  test("valid input -> next() senza errori", () => {
    checkDatiInviati(mockReq(validBody), res, next);
    expect(next).toHaveBeenCalledWith();
  });

  test("mmsi mancante -> MISSING_MMSI", () => {
    checkDatiInviati(
      mockReq({
        latitudine: 41.1234567,
        longitudine: 12.1234567,
        velocita_kmh: 50,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_MMSI");
  });

  test("mmsi non valido -> INVALID_MMSI", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 12345,
        latitudine: 41.1234567,
        longitudine: 12.1234567,
        velocita_kmh: 50,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_MMSI");
  });

  test("latitudine mancante -> MISSING_LATITUDINE", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 123456789,
        longitudine: 12.1234567,
        velocita_kmh: 50,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_LATITUDINE");
  });

  test("latitudine fuori range -> INVALID_LATITUDINE", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 123456789,
        latitudine: 91,
        longitudine: 12.1234567,
        velocita_kmh: 50,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_LATITUDINE");
  });

  test("longitudine mancante -> MISSING_LONGITUDINE", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 123456789,
        latitudine: 41.1234567,
        velocita_kmh: 50,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_LONGITUDINE");
  });

  test("longitudine fuori range -> INVALID_LONGITUDINE", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 123456789,
        latitudine: 41.1234567,
        longitudine: 181,
        velocita_kmh: 50,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_LONGITUDINE");
  });

  test("velocita mancante -> MISSING_VELOCITA_KMH", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 123456789,
        latitudine: 41.1234567,
        longitudine: 12.1234567,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_VELOCITA_KMH");
  });

  test("velocita troppo alta -> INVALID_VELOCITA", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 123456789,
        latitudine: 41.1234567,
        longitudine: 12.1234567,
        velocita_kmh: 201,
        stato: "IN NAVIGAZIONE",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_VELOCITA");
  });

  test("stato non valido -> INVALID_STATO", () => {
    checkDatiInviati(
      mockReq({
        mmsi: 123456789,
        latitudine: 41.1234567,
        longitudine: 12.1234567,
        velocita_kmh: 50,
        stato: "FERMO",
      }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_STATO");
  });
});