/** Auth user from API uses `id`; legacy/local storage may use `_id`. */
export const getUserId = (user) => user?.id ?? user?._id;

export const sameId = (a, b) =>
  a != null && b != null && String(a) === String(b);

export const isProjectOwner = (project, user) =>
  sameId(project?.owner?._id ?? project?.owner, getUserId(user));

export const isProjectMember = (project, user) => {
  const uid = getUserId(user);
  if (!uid || !project?.members) return false;
  return project.members.some((m) => sameId(m?._id ?? m, uid));
};

export const canAccessProject = (project, user) =>
  isProjectOwner(project, user) || isProjectMember(project, user);
