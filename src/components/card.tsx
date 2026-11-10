import type { ReactNode } from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface CardProps {
  children?: ReactNode;
}

const Card = ({ children }: CardProps) => <CardWrapper>{children}</CardWrapper>;

export default Card;
