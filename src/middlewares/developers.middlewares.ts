import { Request, Response, NextFunction } from "express";
import { client } from "../database";
import { QueryConfig } from "pg";

const ensureEmailExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { email } = request.body;

  const queryString: string = `
    SELECT
        *
    FROM
        developers
    WHERE
        email = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [email],
  };

  const queryResult = await client.query(queryConfig);
  if (queryResult.rowCount > 0) {
    return response.status(409).json({
      message: "Email already exists!",
    });
  }
  return next();
};

const ensureDevExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id: string = request.params.id;

  const queryString: string = `
    SELECT
        *
    FROM
        developers
    WHERE
        id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult = await client.query(queryConfig);

  if (queryResult.rowCount > 0) {
    return next();
  }
  return response.status(404).json({
    message: "Developer does not exist!",
  });
};

export { ensureEmailExists, ensureDevExists };
