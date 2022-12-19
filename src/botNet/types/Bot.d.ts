export interface Bot {
  uuid: string,
  threads?: number,
}

export interface BotNetCommand {
  type: string,
  payload: any,
  uuids: Bot[],
}