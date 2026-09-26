export const MAX_MEDIA_BYTES = 5242880;
const types = {'image/jpeg': ['jpg','jpeg'], 'image/png': ['png'], 'image/webp': ['webp']};
export function mediaPathType(path) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(path)) return null;
  return {'jpg':'image/jpeg','png':'image/png','webp':'image/webp'}[path.split('.').pop()] || null;
}
export function validMedia(bytes, type, filename) {
  if (!(bytes instanceof Uint8Array) || bytes.length === 0 || bytes.length > MAX_MEDIA_BYTES || !Object.hasOwn(types,type)) return false;
  if (filename && !types[type].includes(filename.split('.').pop().toLowerCase())) return false;
  if (type === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === 'image/png') return bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
  return bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP';
}
