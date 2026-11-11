import type { ReactNode } from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: ${({ theme }) => theme.spacing[6]};
  box-shadow: ${({ theme }) => theme.boxShadow.md};
`;

interface CardProps {
  children?: ReactNode;
}

const Card = ({ children }: CardProps) => <CardWrapper>{children}</CardWrapper>;

export default Card;
