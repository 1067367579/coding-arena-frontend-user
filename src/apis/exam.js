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


export function examNextQuestionService(examId,questionId) {
    return service({
        url: "/exam/next",
        method: "get",
        params: {
            examId,questionId
        }
    })
} 

export function examPreQuestionService(examId,questionId) {
    return service({
        url: "/exam/pre",
        method: "get",
        params: {
            examId,questionId
        }
    })
} 

export function getExamFirstQuestionService(examId) {
    return service({
        url: "/exam/getFirstQuestion",
        method: "get",
        params: {
            examId
        }
    })
}
