import { back_end } from "../clients/is-rest-client";

export enum UserStoreActionType {
  SET_USER = "SET_USER",
}

export type UserStoreAction = {
    type: UserStoreActionType.SET_USER;
    user: back_end.GetUserDto;
}

export interface UserStoreState {

}
