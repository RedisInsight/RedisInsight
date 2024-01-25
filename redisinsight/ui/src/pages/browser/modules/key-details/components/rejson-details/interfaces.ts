import React from 'react'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export type JSONScalarValue = string | number | boolean | null

export type JSONObjectValue = JSONScalarValue | JSONScalarValue[]

export interface IJSONObject {
  [keyName: string]: IJSONValue
}

export type JSONArrayValue = IJSONObject | JSONObjectValue

export type IJSONValue = JSONScalarValue | IJSONObject | JSONObjectValue | JSONArrayValue[]

export interface IJSONDocument {
  key: string
  type: string
  cardinality?: number
  value: IJSONValue
}

export interface REJSONResponse {
  type: string
  downloaded: boolean
  data: JSONArrayValue[] | IJSONDocument
}

export interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

interface UpdateValueBody {
  // This interface has been kept empty for now.
  // If any changes is to be made to the body format for updating purpose , the necessary properties will be added here.
}

export type IJSONData = IJSONValue | IJSONDocument | IJSONDocument[]

export interface BaseProps {
  data: IJSONData;
  dataType: string;
  parentPath?: string;
  selectedKey: string | RedisResponseBuffer;
  shouldRejsonDataBeDownloaded: boolean;
  onJsonKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void;
  handleSubmitUpdateValue: (body: any) => void;
  handleSubmitJsonUpdateValue: (body: any) => Promise<void>;
  handleRemoveRejsonKeyAction: (key: string | RedisResponseBuffer, path: string, jsonKeyName: string) => Promise<any>;
  handleFetchVisualisationResults: (path: string, forceRetrieve?: boolean) => Promise<any>;
  handleAppendRejsonArrayItemAction: (keyName: string | RedisResponseBuffer, path: string, data: string) => void;
  handleSetRejsonDataAction: (keyName: string | RedisResponseBuffer, path: string, data: string) => void;
}

export interface DynamicTypesProps {
  data: IJSONData;
  parentPath?: string;
  selectedKey: string | RedisResponseBuffer;
  shouldRejsonDataBeDownloaded: boolean;
  onClickRemoveKey: (path: string, keyName: string) => void;
  onClickFunc?: (path: string) => void;
  onJsonKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void;
  handleSubmitJsonUpdateValue: (body: UpdateValueBody) => Promise<void>;
  handleSubmitUpdateValue?: (body: UpdateValueBody) => void;
  handleFetchVisualisationResults: (path: string, forceRetrieve?: boolean) => Promise<any>;
  handleAppendRejsonArrayItemAction: (keyName: string | RedisResponseBuffer, path: string, data: string) => void;
  handleSetRejsonDataAction: (keyName: string | RedisResponseBuffer, path: string, data: string) => void;
}

interface JSONCommonProps {
  keyName: string | number;
  value: IJSONValue;
  cardinality?: number;
  selectedKey: string | RedisResponseBuffer;
  path?: string,
  parentPath: string;
  leftPadding: string;
  handleSubmitJsonUpdateValue: (body: UpdateValueBody) => Promise<void>;
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void;
}

export interface JSONScalarProps extends JSONCommonProps {}

export interface JSONObjectProps extends JSONCommonProps {
  shouldRejsonDataBeDownloaded: boolean;
  onJsonKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void;
  onClickRemoveKey: (path: string, keyName: string) => void;
  handleSubmitUpdateValue?: (body: UpdateValueBody) => void;
  handleSetRejsonDataAction: (keyName: string | RedisResponseBuffer, path: string, data: string) => void;
  handleAppendRejsonArrayItemAction: (keyName: string | RedisResponseBuffer, path: string, data: string) => void;
  handleFetchVisualisationResults: (path: string, forceRetrieve?: boolean) => Promise<any>;
}

export interface JSONArrayProps extends JSONObjectProps{}
