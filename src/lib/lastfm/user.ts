import { userInfoSchema, UserInfo } from "../schemas";
import { lastfmRequest } from "./request";

export async function getUserInfo(): Promise<UserInfo> {
  const data = await lastfmRequest<{
    user: {
      name: string;
      playcount: string;
      registered: { unixtime: string };
      url: string;
    };
  }>({
    method: "user.getinfo",
    schema: userInfoSchema,
    revalidate: 3600,
    label: "user info",
  });

  const user = data.user;
  return {
    name: user.name,
    playcount: parseInt(user.playcount, 10) || 0,
    registeredUnix: parseInt(user.registered.unixtime, 10) || 0,
    url: user.url,
  };
}
