import Cookies from 'js-cookie'

export const decodeJwt = (token) => {
  let [header, payload] = token.split('.')

  // NOTE: JWT uses base64-url encoding which differs a bit from the base64
  // encoding.  Therefore, we need to change '-' to '+' and '_' to '/'
  header = JSON.parse(atob(header.replace(/-/g, '+').replace(/_/g, '/')))
  payload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

  return { header, payload }
}

export const isAuthenticated = () => {
  const jwtToken = Cookies.get('jwtToken')
  if (!jwtToken) {
    return false
  }

  const { payload } = decodeJwt(jwtToken)
  if (new Date(payload.exp * 1000) <= Date.now()) {
    return false
  }

  return true
}

export const updateLocalStorageWithCurrentDentistData = (tokenPayload, currentDentist) => {
    localStorage.setItem("userId", tokenPayload.sub);
    localStorage.setItem("userEmail", tokenPayload.email);
    localStorage.setItem("userFullName", tokenPayload.full_name);

    localStorage.setItem("dentistId", currentDentist.id);
}