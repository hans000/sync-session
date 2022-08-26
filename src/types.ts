export type SubscribeHandle = (addData: SessionData, removeData: SessionData) => void
export type SessionData = Record<string, string>
