import { useEffect, useState } from 'react';
import { toMessage } from '../api/client.js';

// 이전 요청을 중단하고, 현재 주소에 대응하는 결과만 화면에 전달한다.
export default function useResource(load, requestKey) {
    const [attempt, setAttempt] = useState(0);
    const key = requestKey + ':' + attempt;
    const [state, setState] = useState({ key: null, data: null, error: null, errorStatus: null, errorCode: null });
    useEffect(() => {
        const controller = new AbortController();
        Promise.resolve().then(() => load(controller.signal)).then((data) => {
            if (!controller.signal.aborted) setState({ key, data, error: null, errorStatus: null, errorCode: null });
        }).catch((error) => {
            if (!controller.signal.aborted) setState({ key, data: null, error: toMessage(error), errorStatus: error.response?.status, errorCode: error.response?.data?.code });
        });
        return () => controller.abort();
    }, [key, load]);
    return {
        data: state.key === key ? state.data : null,
        error: state.key === key ? state.error : null,
        errorStatus: state.key === key ? state.errorStatus : null,
        errorCode: state.key === key ? state.errorCode : null,
        loading: state.key !== key,
        retry: () => setAttempt(a => a + 1),
    };
}
