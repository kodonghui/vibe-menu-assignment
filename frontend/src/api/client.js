import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',
    timeout: 10000,
});
export async function getResult(url, config) {
    return (await api.get(url, config)).data.result;
}
export async function postResult(url, body) {
    return (await api.post(url, body)).data.result;
}
export async function putResult(url, body) {
    return (await api.put(url, body)).data.result;
}
export async function deleteResult(url) {
    return (await api.delete(url)).data.result;
}
export function toMessage(error) {
    if (axios.isCancel(error)) return null;
    const data = error.response?.data;
    if (data?.code === 'ERROR_CODE_00001') return '삭제되었거나 존재하지 않는 메뉴입니다.';
    if (data?.code === 'ERROR_CODE_00002') return '선택한 카테고리를 찾을 수 없습니다. 카테고리 목록을 다시 확인해 주세요.';
    if (data?.code === 'ERROR_CODE_00003') return '입력값을 확인한 뒤 다시 시도해 주세요.';
    if (error.response) return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    return '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
