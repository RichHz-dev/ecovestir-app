
let _payload: any = null;
let _confirmation: any = null;

export function setCheckoutPayload(payload: any) {
  _payload = payload;
}

export function getCheckoutPayload() {
  return _payload;
}

export function clearCheckoutPayload() {
  _payload = null;
}

export function setConfirmationPayload(payload: any) {
  _confirmation = payload;
}

export function getConfirmationPayload() {
  return _confirmation;
}

export function clearConfirmationPayload() {
  _confirmation = null;
}

export default { setCheckoutPayload, getCheckoutPayload, clearCheckoutPayload, setConfirmationPayload, getConfirmationPayload, clearConfirmationPayload };
