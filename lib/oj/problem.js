const judge_uri = "/code/user";

// {
//     problemID,
//         code,
//         path,
//         lang,
//         nodeID
// }

//提交题目判题
//success -> true; failure -> false
function submit(info) {
    this.$http
        .post(judge_uri, {
            group_id: 0,
            problem_id: info.problemID,
            language: "",
            lang: info.lang,
            source_code: info.code,
            contest_id: 0
        })
        .then(res => {
            this.$store.commit("addSubmission", {
                title: info.problemID,
                url: info.path,
                id: res.data.data,
                nodeid: info.nodeID
            });
        })
        .catch(res => { });
}

export {
    submit
}