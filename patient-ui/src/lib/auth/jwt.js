import Cookies from "js-cookie";

const updateLocalStorage = (userId, userEmail, userFullName, userRole) => {
    localStorage.setItem("userId", userId);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("userFullName", userFullName);
    localStorage.setItem("userRole", userRole);
};

const decodeJwt = (token) => {
    let [header, payload] = token.split(".");

    // NOTE: JWT uses base64-url encoding which differs a bit from the base64
    // encoding.  Therefore, we need to change '-' to '+' and '_' to '/'
    header = JSON.parse(atob(header.replace(/-/g, "+").replace(/_/g, "/")));
    payload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

    return { header, payload };
};

export const isAuthenticated = () => {
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) {
        return false;
    }

    const { payload } = decodeJwt(jwtToken);
    if (new Date(payload.exp * 1000) <= Date.now()) {
        return false;
    }

    updateLocalStorage(
        payload.sub,
        payload.email,
        payload.full_name,
        payload.role,
    );

    return true;
};

export const removeTokenFromCookie = () => {
    Cookies.remove("jwtToken");

    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userRole");
};
