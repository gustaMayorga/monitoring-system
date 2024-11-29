import { DefaultBodyType, PathParams, ResponseComposition, RestContext, RestRequest } from 'msw';

export type ResponseResolver<
  RequestBodyType = DefaultBodyType,
  ResponseBodyType = DefaultBodyType,
  RequestParamsType extends PathParams = PathParams
> = (
  req: RestRequest<RequestBodyType, RequestParamsType>,
  res: ResponseComposition,
  ctx: RestContext
) => Promise<ResponseBodyType> | ResponseBodyType; 