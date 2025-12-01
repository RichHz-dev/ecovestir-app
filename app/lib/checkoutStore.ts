let _payload: any = null;

export function setCheckoutPayload(payload: any) {
  _payload = payload;
}

export function getCheckoutPayload() {
  return _payload;
}

export function clearCheckoutPayload() {
  _payload = null;
}

export default { setCheckoutPayload, getCheckoutPayload, clearCheckoutPayload };
