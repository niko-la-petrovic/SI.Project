import { back_end } from "../clients/is-rest-client";

export interface PostUserPublicKeyRequestDto {
  requestedUserId: string;
}

export interface PostUserPublicKeyRequestMessageDto {
  userId: string;
  requestor: back_end.IGetUserDto;
  requestorPublicKey: string;
}
