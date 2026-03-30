'use client';

import { ReactNode } from 'react';
import { CartProvider as Provider } from './cart-context';

export function CartProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
