import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  DevInfoResult,
  DevResult,
  EnumOS,
  IDevInfo,
  IDevRequest,
  IDevUpdate,
  RetrieveDevResult,
} from "../interfaces/developers.interfaces";

const createDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const { name, email } = request.body;
  const devData: IDevRequest = { name, email };
  const queryString: string = format(
    `
          INSERT INTO
              developers (%I)
          VALUES (%L)
          RETURNING *;
      `,
    Object.keys(devData),
    Object.values(devData)
  );
  const queryResult: DevResult = await client.query(queryString);
  return response.status(201).json(queryResult.rows[0]);
};

const retrieveDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
    SELECT
        dev.id as "developerId",
        dev.name as "developerName",
        dev.email as "developerEmail",
        devi."developerSince" as "developerInfoDeveloperSince",
        devi."preferredOS" as "developerInfoPreferredOS"
    FROM
        developers dev
    LEFT JOIN
        developer_infos devi ON dev.id = devi.id
    LEFT JOIN
        projects pj  ON pj.id = dev.id
    WHERE
        dev.id = $1;`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: RetrieveDevResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

const removeNonMappedKeys = (mappedKeys: string[], payload: any) => {
  const removedKeys = Object.entries(payload).filter(([key, value]) => {
    if (mappedKeys.includes(key)) return [key, value];
  });

  return Object.fromEntries(removedKeys);
};

const updateDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);
  const updateData: IDevUpdate = request.body;
  const requiredKeys: string[] = ["name", "email"];

  const devData: IDevUpdate | string[] = removeNonMappedKeys(
    requiredKeys,
    updateData
  );

  const queryString: string = format(
    `
    UPDATE
        developers
    SET(%I) = ROW(%L)
    WHERE
        id = $1
    RETURNING *;
    `,
    Object.keys(devData),
    Object.values(devData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: DevResult = await client.query(queryConfig);
  return response.status(200).json(queryResult.rows[0]);
};

const deleteDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
          DELETE FROM
              developers
          WHERE
              id = $1;
      `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: DevResult = await client.query(queryConfig);

  return response.status(204).send();
};

const setInfo = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerId: number = parseInt(request.params.id);
  const { developerSince, preferredOS }: IDevInfo = request.body;
  const data = { developerSince, preferredOS, developerId };

  let queryString: string = `
  SELECT
      *
  FROM
      developer_infos
  WHERE
      "developerId" = $1
`;
  let queryConfig: QueryConfig = {
    text: queryString,
    values: [developerId],
  };
  const queryResultTest = await client.query(queryConfig);
  if (queryResultTest.rowCount > 0) {
    return response.status(409).json({
      message: "Developer infos already exists.",
    });
  }

  const requiredKeysList: Array<EnumOS> = ["Windows", "Linux", "MacOS"];
  let test: boolean = true;

  if (preferredOS == "Windows") {
    test = true;
  } else if (preferredOS == "Linux") {
    test = true;
  } else if (preferredOS == "MacOS") {
    test = true;
  } else {
    test = false;
  }

  if (!test) {
    return response.status(400).json({
      message: `Preferred OS are ${requiredKeysList}`,
    });
  }

  queryString = format(
    `
        INSERT INTO
            developer_infos (%I)
        VALUES (%L)
        RETURNING *;
    `,
    Object.keys(data),
    Object.values(data)
  );
  let queryResult: DevInfoResult = await client.query(queryString);

  return response.json(queryResult.rows[0]);
};

export { createDev, retrieveDev, updateDev, deleteDev, setInfo };
