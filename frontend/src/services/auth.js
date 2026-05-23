export function saveAuth(data) {
  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
}

export function getToken() {
  return sessionStorage.getItem("token");
}

export function getUser() {
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

export function isAuthenticated() {
  return !!sessionStorage.getItem("token");
}