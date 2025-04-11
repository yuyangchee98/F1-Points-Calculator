import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

// Use this typed hook instead of the regular useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;