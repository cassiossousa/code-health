import type { ReactNode } from 'react';
import { styled } from 'styled-components';

const variants = {
  h1: styled.h1`
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
  `,
  h2: styled.h2`
    font-size: 30px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.015em;
  `,
  h3: styled.h3`
    font-size: 24px;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: 0;
  `,
  p: styled.p`
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0;
  `,
  span: styled.span`
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0;
  `,
};

interface TypographyProps {
  children?: ReactNode;
  variant?: keyof typeof variants;
  id?: string;
  title?: string;
  className?: string;
  role?: string;
}

function Typography({ variant = 'p', ...props }: TypographyProps) {
  const Element = variants[variant];
  return <Element {...props} />;
}

export default Typography;
