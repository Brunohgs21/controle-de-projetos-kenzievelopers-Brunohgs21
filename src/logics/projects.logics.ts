import { Request, Response, response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  IProject,
  ProjectResult,
  RetrieveProjectResult,
} from "../interfaces/projects.interfaces";

const removeNonMappedKeys = (mappedKeys: string[], payload: any) => {
  const removedKeys = Object.entries(payload).filter(([key, value]) => {
    if (mappedKeys.includes(key)) return [key, value];
  });

  return Object.fromEntries(removedKeys);
};

const validateRequiredKeys = (
  requiredKeys: string[],
  payload: any
): Array<string> => {
  const payloadKeys: string[] = Object.keys(payload);
  const missingKeys: string[] = [];

  requiredKeys.forEach((requiredKey: string): void => {
    if (!payloadKeys.includes(requiredKey)) {
      missingKeys.push(requiredKey);
    }
  });

  return missingKeys;
};

const createProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requiredKeys: Array<string> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "developerId",
    "endDate",
  ];

  const projectData = removeNonMappedKeys(requiredKeys, request.body);

  const allRequiredKeys: Array<string> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "developerId",
  ];

  const validatedKeys: string[] = validateRequiredKeys(
    allRequiredKeys,
    request.body
  );

  if (validatedKeys.length > 0) {
    return response.status(400).json({
      error: `Missing required keys: ${validatedKeys}`,
    });
  }

  const queryString: string = format(
    `
    INSERT INTO
        projects(%I)
    VALUES
        (%L)
    RETURNING *;
  `,
    Object.keys(projectData),
    Object.values(projectData)
  );

  const queryResult: ProjectResult = await client.query(queryString);

  return response.status(201).json(queryResult.rows[0]);
};

const retrieveProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString: string = `
  SELECT
        pj.id AS "projectId",
        pj."name" AS "projectName",
        pj.description AS "projectDescription",
        pj."estimatedTime" AS "projectEstimatedTime",
        pj.repository  AS "projectRepository",
        pj."startDate" AS "projectStartDate",
        pj."endDate"  AS "projectEndDate",
        pj."developerId" AS "projectDeveloperId",
        t.id AS "technologyId",
        t."name" AS "technologyName"
 FROM
	    projects pj
 LEFT JOIN
	    projects_technologies pt ON pj.id = pt."projectId"
 LEFT JOIN
	    technologies t ON pt."technologyId" = t.id
 WHERE
	    pj.id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: RetrieveProjectResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

const updateProject = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);
  const updatableFields: string[] = [
    "name",
    "description",
    "repository",
    "startDate",
    "endDate",
    "estimatedTime",
  ];
  const validatedData = removeNonMappedKeys(updatableFields, request.body);

  const queryString: string = format(
    `
    UPDATE
        projects
    SET(%I) = ROW(%L)
    WHERE
        id = $1
    RETURNING *;
  `,
    Object.keys(validatedData),
    Object.values(validatedData)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: ProjectResult = await client.query(queryConfig);
  return response.status(200).json(queryResult.rows[0]);
};

const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  const queryString: string = `
          DELETE FROM
              projects
          WHERE
              id = $1;
      `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: ProjectResult = await client.query(queryConfig);

  return res.status(204).send();
};

const postTechnology = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const { name } = request.body;
  const projectId: number = parseInt(request.params.id);

  let queryString: string = `
      SELECT
          *
      FROM
        technologies
      WHERE
        name = $1;
    `;
  let queryConfig: QueryConfig = {
    text: queryString,
    values: [name],
  };
  const queryResultTech = await client.query(queryConfig);
  if (queryResultTech.rowCount === 0) {
    return response.status(404).json({
      message: "Technology not suported!",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
      ],
    });
  }

  const techId: number = queryResultTech.rows[0].id;

  queryString = `
    SELECT
        *
    FROM
        projects_technologies
    WHERE
        "projectId" = $1 AND "technologyId" = $2;
  `;
  queryConfig = {
    text: queryString,
    values: [projectId, techId],
  };
  const queryResult = await client.query(queryConfig);
  console.log(queryResult.rows);
  if (queryResult.rowCount > 0) {
    return response.status(409).json({
      message: "Technology already exists in this project!",
    });
  }

  const date = new Date();

  queryString = `
        INSERT INTO
            projects_technologies("projectId","technologyId", "addedIn")
        VALUES
            ($1,$2, $3)
        RETURNING *;
      `;
  queryConfig = {
    text: queryString,
    values: [projectId, queryResultTech.rows[0].id, date],
  };

  const querytech = await client.query(queryConfig);

  queryString = `
        SELECT
            tc.id AS "technologyId",
            tc.name AS "technologyName",
            pj.id AS "projectId",
            pj.name AS "projectName",
            pj.description As "projectDescription",
            pj."estimatedTime" AS "projectEstimatedTime",
            pj.repository AS "projectRepository",
            pj."startDate" AS "projectStartDate",
            pj."endDate" AS "projectEndDate"
        FROM
            projects pj
        LEFT JOIN
              projects_technologies pt ON pj.id = pt."projectId"
        LEFT JOIN
              technologies tc ON pt."technologyId" = tc.id
        WHERE
            pj.id = $1;
      `;

  queryConfig = {
    text: queryString,
    values: [projectId],
  };

  const queryResultProject: ProjectResult = await client.query(queryConfig);

  return response.json(queryResultProject.rows);
};

export {
  createProject,
  retrieveProject,
  updateProject,
  deleteProject,
  postTechnology,
};
