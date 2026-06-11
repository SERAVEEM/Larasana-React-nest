import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export const Meta = ({ title, description, children }: MetaProps) => (
  <>
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
    {children}
  </>
);
