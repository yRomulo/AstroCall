
/**
 * @deprecated Use hooks e funções de @/firebase.
 * Este arquivo foi mantido para evitar erros de importação em arquivos legados durante a migração.
 */
import { initializeFirebase } from '@/firebase';

const { auth, firestore } = initializeFirebase();
const db = firestore;

export { auth, db };
