---
title: bangumi源代码
---


nsfw（Not safe on work）内容限制
`DateTime.now().toUnixInteger() - user.regTime >= 60 * 60 * 24 * 90`大于等于

https://github.com/bangumi/server-private/commit/3d2ff6efc19822af9edf7c47aa280b1ddb1d9f17#diff-b93d43fd97a9b44bfa6c9e6733e16b96e04003bdaf70145f8d7846709dc954ee


```ts
async function userToAuth(user: IUser): Promise<IAuth> {
  const perms = await getPermission(user.groupID);
  return {
    userID: user.id,
    login: true,
    permission: perms,
    allowNsfw:
      !nsfwRestrictedUIDs.has(user.id) &&
      !perms.ban_visit &&
      !perms.user_ban &&
      DateTime.now().toUnixInteger() - user.regTime >= 60 * 60 * 24 * 90,
    regTime: user.regTime,
    groupID: user.groupID,
  };
}
```



swipeLevelControl