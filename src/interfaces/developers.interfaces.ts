import { QueryResult } from "pg";

interface IDevRequest {
  name: string;
  email: string;
}

interface IDevUpdate {
  name?: string;
  email?: string;
}

interface INewDev extends IDevRequest {
  id: number;
}

interface IRetrievDev {
  developerId: number;
  developerName: string;
  developerEmail: string;
  developerInfoDeveloperSince: Date | null;
  developerInfoPreferredOS: string | null;
}

interface IDevInfo {
  developerSince: Date;
  preferredOS: "Windows" | "Linux" | "MacOS";
}

interface IDevInfoResponse extends IDevInfo {
  id: number;
  developerId: number;
}

type DevInfoResult = QueryResult<IDevInfoResponse>;

type RetrieveDevResult = QueryResult<IRetrievDev>;

type DevResult = QueryResult<INewDev>;

type EnumOS = "Windows" | "Linux" | "MacOS";

export {
  IDevRequest,
  INewDev,
  DevResult,
  EnumOS,
  RetrieveDevResult,
  IDevUpdate,
  IDevInfo,
  IDevInfoResponse,
  DevInfoResult,
};
