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

export function getUserDetailService() {
    return service({
        url: "/user/detail",
        method: "get"
    })
}

export function editUserService(data) {
    return service({
        url: "/user/edit",
        method: "put",
        data        
    })
} 

export function updateAvatarService(data) {
    return service({
        url: "/user/avatar/update",
        method: "post",
        data
    })
}

export function userSubmitService(data) {
    return service({
        url: "/user/question/rabbit/submit",
        method: "post",
        data
    })
    
}