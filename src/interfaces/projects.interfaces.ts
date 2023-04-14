import { QueryResult } from "pg";

interface IProject {
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate?: Date;
  developerId: number;
}

interface IRetrieveProject {
  projectId: number;
  projectName: string;
  projectDescription: string;
  projectEstimatedTime: string;
  projectRepository: string;
  projectStartDate: Date;
  projectEndDate: Date;
  projectDeveloperId: number;
  technologyId: number | null;
  technologyName: number | null;
}

interface ITech {
  name: string;
  id: number;
}

type RetrieveProjectResult = QueryResult<IRetrieveProject>;

type ProjectResult = QueryResult<IProject>;

export {
  IProject,
  ProjectResult,
  IRetrieveProject,
  RetrieveProjectResult,
  ITech,
};
