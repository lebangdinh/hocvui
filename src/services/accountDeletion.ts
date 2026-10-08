import {httpsCallable} from 'firebase/functions';
import {functions} from '../firebase';
export const removeProfileServer = async (profileId:string) => {
  const call=httpsCallable(functions,'deleteChildProfile');
  await call({profileId});
};
export const eraseAccountServer = async () => {
  const call=httpsCallable(functions,'deleteMyAccount');
  await call({});
};
