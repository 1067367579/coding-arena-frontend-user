import service from "@/utils/request";
export function sendCodeService(data) {
    return service({
        url: "/user/code",
        method: "post",
        data
    })
}

export function codeLoginService(data) {
    return service({
        url: "/user/login",
        method: "post",
        data
    })
}

export function logoutService() {
    return service({
        url: "/user/logout",
        method: "delete"
    })
}

export function getUserInfoService() {
    return service({
        url: "/user/info",
        method: "get"
    })
}
