import { Request } from "express";
import { validateLoginBody, validateRegisterBody } from "../middlewares/AuthMiddleware.js";
import { AppError } from "../models/AppErrorModel.js";

const mockReq = (body: object) =>
  ({ body } as unknown as Request);
const next = jest.fn();
const getError = () => next.mock.calls[0][0] as AppError;
const res = {} as any;

const validRegisterBody = {
  username: "utenteTest1",
  email: "utente@test.com",
  password: "Password1",
};

const validLoginBody = {
  email: "utente@test.com",
  password: "Password1",
};

// --------------------------------------------------
// validateRegisterBody
// --------------------------------------------------

describe("validateRegisterBody", () => {
  beforeEach(() => jest.resetAllMocks());

  test("valid input -> next() senza errori", () => {
    validateRegisterBody(
      mockReq(validRegisterBody),
      res,
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  test("username mancante -> MISSING_USERNAME", () => {
    const bodyIncompleto = {...validRegisterBody}
    delete (bodyIncompleto as any)["username"];
    validateRegisterBody(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_USERNAME");
  });
  test("username non valido -> INVALID_USERNAME", () => {
    validateRegisterBody(
      mockReq({ ...validRegisterBody, username: "utente@1" }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_USERNAME");
  });

  test("email mancante -> MISSING_EMAIL", () => {
    const bodyIncompleto = {...validRegisterBody}
    delete (bodyIncompleto as any)["email"];
    validateRegisterBody(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_EMAIL");
  });

  test("email non valida -> INVALID_EMAIL", () => {
    validateRegisterBody(
      mockReq({ ...validRegisterBody, email: "utente-test.com" }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_EMAIL");
  });

  test("password mancante -> MISSING_PASSWORD", () => {
    const bodyIncompleto = {...validRegisterBody}
    delete (bodyIncompleto as any)["password"];
    validateRegisterBody(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_PASSWORD");
  });

  test("password non valida -> INVALID_PASSWORD", () => {
    validateRegisterBody(
      mockReq({ ...validRegisterBody, password: "password" }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_PASSWORD");
  });
});

// --------------------------------------------------
// validateLoginBody
// --------------------------------------------------

describe("validateLoginBody", () => {
  beforeEach(() => jest.resetAllMocks());

  test("valid input -> next() senza errori", () => {
    validateLoginBody(
      mockReq(validLoginBody),
      res,
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  test("email mancante -> MISSING_EMAIL", () => {
    const bodyIncompleto = {...validLoginBody}
    delete (bodyIncompleto as any)["email"];
    validateLoginBody(
      mockReq({ password: "Password1" }),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_EMAIL");
  });

  test("email non valida -> INVALID_EMAIL", () => {
    validateLoginBody(
      mockReq({ ...validLoginBody, email: "utente-test.com" }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_EMAIL");
  });

  test("password mancante -> MISSING_PASSWORD", () => {
    const bodyIncompleto = {...validLoginBody}
    delete (bodyIncompleto as any)["password"];
    validateLoginBody(
      mockReq(bodyIncompleto),
      res,
      next
    );

    expect(getError().statusName).toBe("MISSING_PASSWORD");
  });

  test("password non valida -> INVALID_PASSWORD", () => {
    validateLoginBody(
      mockReq({ ...validLoginBody, password: "password" }),
      res,
      next
    );

    expect(getError().statusName).toBe("INVALID_PASSWORD");
  });
});