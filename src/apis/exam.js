import service from "@/utils/request";

export function getExamListService(params) {
    return service({
        url: "/exam/semiLogin/redis/list",
        method: "get",
        params
    })
}

export function enterExamService(data) {
    return service({
        url: "/user/exam/enter",
        method: "post",
        data
    })
} 

export function getExamRankListService() {

}

export function getMyExamListService(params) {
    return service({
        url: "/user/exam/list",
        method: "get",
        params
    });
}