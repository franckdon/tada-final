export type ServiceOk<T> = { ok: true; data: T };
export type ServiceErr = { ok: false; status: number; message: string };
export type ServiceResult<T> = ServiceOk<T> | ServiceErr;
