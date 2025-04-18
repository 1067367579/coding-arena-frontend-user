import service from "@/utils/request";

export function getQuestionListService(params) {
    return service({
        url: "/question/semiLogin/list",
        method: "get",
        params
    })
}

export function getHotQuestionListService() {

}