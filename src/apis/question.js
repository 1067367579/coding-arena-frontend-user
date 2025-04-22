import service from "@/utils/request";

export function getQuestionListService(params) {
    return service({
        url: "/question/semiLogin/list",
        method: "get",
        params
    })
}

export function getHotQuestionListService(top) {
    return service({
        url: "/user/question/hot",
        method: "get",
        params: {
            top
        }
    })
}

export function getQuestionDetailService(questionId) {
    return service({
        url: "/question/detail",
        method: "get",
        params: {
            questionId
        }
    })
}

export function preQuestionService(questionId) {
    return service({
        url: "/question/pre",
        method: "get",
        params: {
            questionId
        }
    })
}

export function nextQuestionService(questionId) {
    return service({
        url: "/question/next",
        method: "get",
        params: {
            questionId
        }
    })
} 

export function getQuestionResultService(examId,questionId,currentTime) {
    return service({
        url: "/user/question/exe/result",
        method: "get",
        params: {
            examId,questionId,currentTime
        }
    })

}